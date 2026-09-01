package com.pht.dev_edu.file.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.lang.reflect.Field;
import java.net.MalformedURLException;
import java.net.URI;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.exception.server.ServerInternalException;
import com.pht.dev_edu.file.config.FileMultipartProperties;
import com.pht.dev_edu.file.dto.*;
import com.pht.dev_edu.file.entity.FileUploadEntity;
import com.pht.dev_edu.file.repo.FileUploadRepository;

import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedUploadPartRequest;
import software.amazon.awssdk.services.s3.presigner.model.UploadPartPresignRequest;

@ExtendWith(MockitoExtension.class)
class FileMultipartServiceImplTest {

    @Mock
    private FileUploadRepository fileUploadRepository;
    @Mock
    private S3Presigner s3Presigner;
    @Mock
    private S3Client s3Client;
    @Mock
    private FileMultipartSessionStore sessionStore;
    @Spy
    private FileMultipartProperties multipartProperties = new FileMultipartProperties();

    @InjectMocks
    private FileMultipartServiceImpl multipartService;

    private static final String PUBLIC_BUCKET = "public-bucket";
    private static final String PRIVATE_BUCKET = "private-bucket";
    private static final String PUBLIC_URL = "https://cdn.example.com";
    private static final String USERNAME = "testuser";
    private static final String OTHER_USER = "otheruser";
    private static final String SESSION_ID = "session-12345";
    private static final String UPLOAD_ID = "upload-id-abc";
    private static final String PRESIGNED_PART_URL = "https://s3.example.com/part-presigned";
    private static final String DOWNLOAD_URL = "https://s3.example.com/download-file";

    @BeforeEach
    void setUp() throws Exception {
        setField("publicBucketName", PUBLIC_BUCKET);
        setField("privateBucketName", PRIVATE_BUCKET);
        setField("publicUrl", PUBLIC_URL);

        multipartProperties.setChunkSize(20 * 1024 * 1024L); // 20 MB
        multipartProperties.setPresignWindowSize(20);
        multipartProperties.setUploadConcurrency(5);
        multipartProperties.setPresignExpiration(Duration.ofMinutes(30));
        multipartProperties.setSessionExpiration(Duration.ofHours(24));
    }

    private void setField(String fieldName, Object value) throws Exception {
        Field field = FileMultipartServiceImpl.class.getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(multipartService, value);
    }

    private MultipartUploadSession buildSession(UploadStatus status, int totalParts) {
        return MultipartUploadSession.builder()
                .sessionId(SESSION_ID)
                .uploadId(UPLOAD_ID)
                .objectKey("dev_edu/12345-largefile.mp4")
                .fullObjectKey(PUBLIC_BUCKET + "/dev_edu/12345-largefile.mp4")
                .bucketName(PUBLIC_BUCKET)
                .fileName("largefile.mp4")
                .contentType("video/mp4")
                .fileSize(45L * 1024 * 1024) // 45 MB
                .chunkSize(20L * 1024 * 1024) // 20 MB
                .totalParts(totalParts)
                .username(USERNAME)
                .isPublic(true)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusHours(24))
                .status(status)
                .build();
    }

    private PresignedUploadPartRequest buildPresignedUploadPartResponse() throws MalformedURLException {
        PresignedUploadPartRequest presigned = mock(PresignedUploadPartRequest.class);
        when(presigned.url()).thenReturn(URI.create(PRESIGNED_PART_URL).toURL());
        return presigned;
    }

    private PresignedGetObjectRequest buildPresignedGetResponse() throws MalformedURLException {
        PresignedGetObjectRequest presigned = mock(PresignedGetObjectRequest.class);
        when(presigned.url()).thenReturn(URI.create(DOWNLOAD_URL).toURL());
        return presigned;
    }

    // ==================== INIT TESTS ====================

    @Nested
    @DisplayName("initMultipartUpload Tests")
    class InitTests {

        @Test
        @DisplayName("Should initialize multipart upload successfully with correct part calculation")
        void shouldInitMultipartUploadSuccessfully() {
            // 45 MB file with 20 MB chunk size -> 3 parts (20MB, 20MB, 5MB)
            MultipartUploadInitRequest req = MultipartUploadInitRequest.builder()
                    .fileName("largefile.mp4")
                    .contentType("video/mp4")
                    .fileSize(45L * 1024 * 1024)
                    .isPublic(true)
                    .username(USERNAME)
                    .build();

            when(s3Client.createMultipartUpload(any(CreateMultipartUploadRequest.class)))
                    .thenReturn(CreateMultipartUploadResponse.builder().uploadId(UPLOAD_ID).build());

            MultipartUploadInitResponse response = multipartService.initMultipartUpload(req);

            assertThat(response).isNotNull();
            assertThat(response.getSessionId()).isNotBlank();
            assertThat(response.getTotalParts()).isEqualTo(3);
            assertThat(response.getChunkSize()).isEqualTo(20 * 1024 * 1024L);
            assertThat(response.getWindowSize()).isEqualTo(20);
            assertThat(response.getConcurrency()).isEqualTo(5);
            assertThat(response.getObjectKey()).startsWith(PUBLIC_BUCKET + "/dev_edu/");
            assertThat(response.getPublicUrl()).isNotNull();

            verify(s3Client).createMultipartUpload(any(CreateMultipartUploadRequest.class));
            verify(fileUploadRepository).save(any(FileUploadEntity.class));
            verify(sessionStore).save(any(MultipartUploadSession.class), any(Duration.class));
        }

        @Test
        @DisplayName("Should handle single chunk for small file")
        void shouldHandleSingleChunkForSmallFile() {
            MultipartUploadInitRequest req = MultipartUploadInitRequest.builder()
                    .fileName("smallfile.txt")
                    .contentType("text/plain")
                    .fileSize(2 * 1024 * 1024L) // 2 MB < 20 MB
                    .isPublic(false)
                    .username(USERNAME)
                    .build();

            when(s3Client.createMultipartUpload(any(CreateMultipartUploadRequest.class)))
                    .thenReturn(CreateMultipartUploadResponse.builder().uploadId(UPLOAD_ID).build());

            MultipartUploadInitResponse response = multipartService.initMultipartUpload(req);

            assertThat(response).isNotNull();
            assertThat(response.getTotalParts()).isEqualTo(1);
            assertThat(response.getObjectKey()).startsWith(PRIVATE_BUCKET + "/dev_edu/");
            assertThat(response.getPublicUrl()).isNull();
        }

        @Test
        @DisplayName("Should throw BadRequestException for invalid file size or blank inputs")
        void shouldThrowBadRequestForInvalidInputs() {
            MultipartUploadInitRequest zeroSize = MultipartUploadInitRequest.builder()
                    .fileName("file.txt")
                    .contentType("text/plain")
                    .fileSize(0L)
                    .username(USERNAME)
                    .build();

            assertThatThrownBy(() -> multipartService.initMultipartUpload(zeroSize))
                    .isInstanceOf(BadRequestException.class);

            MultipartUploadInitRequest blankName = MultipartUploadInitRequest.builder()
                    .fileName("")
                    .contentType("text/plain")
                    .fileSize(100L)
                    .username(USERNAME)
                    .build();

            assertThatThrownBy(() -> multipartService.initMultipartUpload(blankName))
                    .isInstanceOf(BadRequestException.class);
        }

        @Test
        @DisplayName("Should throw ServerInternalException when S3 createMultipartUpload fails")
        void shouldThrowServerInternalWhenS3Fails() {
            MultipartUploadInitRequest req = MultipartUploadInitRequest.builder()
                    .fileName("file.mp4")
                    .contentType("video/mp4")
                    .fileSize(50 * 1024 * 1024L)
                    .username(USERNAME)
                    .build();

            when(s3Client.createMultipartUpload(any(CreateMultipartUploadRequest.class)))
                    .thenThrow(S3Exception.builder().message("R2 service unavailable").build());

            assertThatThrownBy(() -> multipartService.initMultipartUpload(req))
                    .isInstanceOf(ServerInternalException.class)
                    .hasMessageContaining("Failed to initiate multipart upload");
        }
    }

    // ==================== PRESIGN TESTS ====================

    @Nested
    @DisplayName("presignMultipartParts Tests")
    class PresignTests {

        @Test
        @DisplayName("Should generate batch of presigned part URLs correctly respecting windowSize")
        void shouldGeneratePresignedUrlsRespectingWindowSize() throws Exception {
            MultipartUploadSession session = buildSession(UploadStatus.PENDING, 25);
            when(sessionStore.findById(SESSION_ID)).thenReturn(Optional.of(session));

            PresignedUploadPartRequest presigned = buildPresignedUploadPartResponse();
            when(s3Presigner.presignUploadPart(any(UploadPartPresignRequest.class))).thenReturn(presigned);

            MultipartUploadPresignRequest req = MultipartUploadPresignRequest.builder()
                    .fromPart(1)
                    .build();

            MultipartUploadPresignResponse response = multipartService.presignMultipartParts(SESSION_ID, req, USERNAME);

            assertThat(response).isNotNull();
            assertThat(response.getSessionId()).isEqualTo(SESSION_ID);
            // Window size is 20, so 1..20
            assertThat(response.getParts()).hasSize(20);
            assertThat(response.getParts().get(0).getPartNumber()).isEqualTo(1);
            assertThat(response.getParts().get(19).getPartNumber()).isEqualTo(20);

            // S3Presigner signs locally — no S3Client calls made
            verify(s3Presigner, times(20)).presignUploadPart(any(UploadPartPresignRequest.class));
            verifyNoInteractions(s3Client);
        }

        @Test
        @DisplayName("Should generate remaining parts for last batch")
        void shouldGenerateRemainingPartsForLastBatch() throws Exception {
            MultipartUploadSession session = buildSession(UploadStatus.PENDING, 25);
            when(sessionStore.findById(SESSION_ID)).thenReturn(Optional.of(session));

            PresignedUploadPartRequest presigned = buildPresignedUploadPartResponse();
            when(s3Presigner.presignUploadPart(any(UploadPartPresignRequest.class))).thenReturn(presigned);

            MultipartUploadPresignRequest req = MultipartUploadPresignRequest.builder()
                    .fromPart(21)
                    .build();

            MultipartUploadPresignResponse response = multipartService.presignMultipartParts(SESSION_ID, req, USERNAME);

            assertThat(response).isNotNull();
            // Total 25, fromPart 21 -> 21, 22, 23, 24, 25 (5 parts)
            assertThat(response.getParts()).hasSize(5);
            assertThat(response.getParts().get(0).getPartNumber()).isEqualTo(21);
            assertThat(response.getParts().get(4).getPartNumber()).isEqualTo(25);
        }

        @Test
        @DisplayName("Should throw BadRequestException for invalid fromPart")
        void shouldThrowBadRequestForInvalidFromPart() {
            MultipartUploadSession session = buildSession(UploadStatus.PENDING, 3);
            when(sessionStore.findById(SESSION_ID)).thenReturn(Optional.of(session));

            MultipartUploadPresignRequest req0 = MultipartUploadPresignRequest.builder().fromPart(0).build();
            assertThatThrownBy(() -> multipartService.presignMultipartParts(SESSION_ID, req0, USERNAME))
                    .isInstanceOf(BadRequestException.class);

            MultipartUploadPresignRequest req4 = MultipartUploadPresignRequest.builder().fromPart(4).build();
            assertThatThrownBy(() -> multipartService.presignMultipartParts(SESSION_ID, req4, USERNAME))
                    .isInstanceOf(BadRequestException.class);
        }

        @Test
        @DisplayName("Should reject presign when session belongs to another user")
        void shouldRejectPresignForOtherUser() {
            MultipartUploadSession session = buildSession(UploadStatus.PENDING, 3);
            when(sessionStore.findById(SESSION_ID)).thenReturn(Optional.of(session));

            MultipartUploadPresignRequest req = MultipartUploadPresignRequest.builder().fromPart(1).build();
            assertThatThrownBy(() -> multipartService.presignMultipartParts(SESSION_ID, req, OTHER_USER))
                    .isInstanceOf(BadRequestException.class);
        }

        @Test
        @DisplayName("Should throw DataNotFoundException when session expired")
        void shouldThrowDataNotFoundWhenSessionExpired() {
            MultipartUploadSession session = buildSession(UploadStatus.PENDING, 3);
            session.setExpiresAt(LocalDateTime.now().minusMinutes(5));
            when(sessionStore.findById(SESSION_ID)).thenReturn(Optional.of(session));

            MultipartUploadPresignRequest req = MultipartUploadPresignRequest.builder().fromPart(1).build();
            assertThatThrownBy(() -> multipartService.presignMultipartParts(SESSION_ID, req, USERNAME))
                    .isInstanceOf(DataNotFoundException.class)
                    .hasMessageContaining("expired");
        }

        @Test
        @DisplayName("Should throw IllegalStateException when session is already COMPLETED or FAILED")
        void shouldThrowIllegalStateWhenSessionNotPending() {
            MultipartUploadSession session = buildSession(UploadStatus.COMPLETED, 3);
            when(sessionStore.findById(SESSION_ID)).thenReturn(Optional.of(session));

            MultipartUploadPresignRequest req = MultipartUploadPresignRequest.builder().fromPart(1).build();
            assertThatThrownBy(() -> multipartService.presignMultipartParts(SESSION_ID, req, USERNAME))
                    .isInstanceOf(IllegalStateException.class);
        }
    }

    // ==================== COMPLETE TESTS ====================

    @Nested
    @DisplayName("completeMultipartUpload Tests")
    class CompleteTests {

        @Test
        @DisplayName("Should complete multipart upload successfully when all parts are valid and sorted")
        void shouldCompleteMultipartUploadSuccessfully() throws Exception {
            MultipartUploadSession session = buildSession(UploadStatus.PENDING, 3);
            when(sessionStore.findById(SESSION_ID)).thenReturn(Optional.of(session));

            FileUploadEntity entity = FileUploadEntity.builder()
                    .objectKey(session.getFullObjectKey())
                    .status(UploadStatus.PENDING)
                    .build();
            when(fileUploadRepository.findByObjectKey(session.getFullObjectKey())).thenReturn(Optional.of(entity));

            PresignedGetObjectRequest downloadPresigned = buildPresignedGetResponse();
            when(s3Presigner.presignGetObject(any(GetObjectPresignRequest.class))).thenReturn(downloadPresigned);

            when(s3Client.completeMultipartUpload(any(CompleteMultipartUploadRequest.class)))
                    .thenReturn(CompleteMultipartUploadResponse.builder().build());

            // FE sends unordered parts with quoted ETags
            MultipartUploadCompleteRequest req = MultipartUploadCompleteRequest.builder()
                    .parts(List.of(
                            MultipartUploadPartDto.builder().partNumber(3).eTag("\"etag-3\"").build(),
                            MultipartUploadPartDto.builder().partNumber(1).eTag("\"etag-1\"").build(),
                            MultipartUploadPartDto.builder().partNumber(2).eTag("etag-2").build()
                    ))
                    .build();

            FileUploadResponse response = multipartService.completeMultipartUpload(SESSION_ID, req, USERNAME);

            assertThat(response).isNotNull();
            assertThat(response.getObjectKey()).isEqualTo(session.getFullObjectKey());
            assertThat(response.getDownloadUrl()).isEqualTo(DOWNLOAD_URL);
            assertThat(response.getPublicUrl()).isNotNull();

            // Verify S3 complete called with sorted parts and clean ETags
            ArgumentCaptor<CompleteMultipartUploadRequest> captor = ArgumentCaptor.forClass(CompleteMultipartUploadRequest.class);
            verify(s3Client).completeMultipartUpload(captor.capture());
            CompleteMultipartUploadRequest s3Req = captor.getValue();
            assertThat(s3Req.multipartUpload().parts()).hasSize(3);
            assertThat(s3Req.multipartUpload().parts().get(0).partNumber()).isEqualTo(1);
            assertThat(s3Req.multipartUpload().parts().get(0).eTag()).isEqualTo("etag-1");
            assertThat(s3Req.multipartUpload().parts().get(1).partNumber()).isEqualTo(2);
            assertThat(s3Req.multipartUpload().parts().get(1).eTag()).isEqualTo("etag-2");
            assertThat(s3Req.multipartUpload().parts().get(2).partNumber()).isEqualTo(3);
            assertThat(s3Req.multipartUpload().parts().get(2).eTag()).isEqualTo("etag-3");

            // Verify DB entity updated to COMPLETED
            assertThat(entity.getStatus()).isEqualTo(UploadStatus.COMPLETED);
            assertThat(entity.getConfirmedAt()).isNotNull();
            verify(fileUploadRepository).save(entity);
        }

        @Test
        @DisplayName("Should return existing result when complete is called idempotently on COMPLETED session")
        void shouldBeIdempotentWhenAlreadyCompleted() throws Exception {
            MultipartUploadSession session = buildSession(UploadStatus.COMPLETED, 3);
            when(sessionStore.findById(SESSION_ID)).thenReturn(Optional.of(session));

            PresignedGetObjectRequest downloadPresigned = buildPresignedGetResponse();
            when(s3Presigner.presignGetObject(any(GetObjectPresignRequest.class))).thenReturn(downloadPresigned);

            MultipartUploadCompleteRequest req = MultipartUploadCompleteRequest.builder()
                    .parts(List.of(
                            MultipartUploadPartDto.builder().partNumber(1).eTag("etag-1").build(),
                            MultipartUploadPartDto.builder().partNumber(2).eTag("etag-2").build(),
                            MultipartUploadPartDto.builder().partNumber(3).eTag("etag-3").build()
                    ))
                    .build();

            FileUploadResponse response = multipartService.completeMultipartUpload(SESSION_ID, req, USERNAME);

            assertThat(response).isNotNull();
            verifyNoInteractions(s3Client);
        }

        @Test
        @DisplayName("Should reject complete when parts are missing or count mismatch")
        void shouldRejectWhenPartsMissing() {
            MultipartUploadSession session = buildSession(UploadStatus.PENDING, 3);
            when(sessionStore.findById(SESSION_ID)).thenReturn(Optional.of(session));

            // Only 2 parts provided for 3-part upload
            MultipartUploadCompleteRequest req = MultipartUploadCompleteRequest.builder()
                    .parts(List.of(
                            MultipartUploadPartDto.builder().partNumber(1).eTag("etag-1").build(),
                            MultipartUploadPartDto.builder().partNumber(2).eTag("etag-2").build()
                    ))
                    .build();

            assertThatThrownBy(() -> multipartService.completeMultipartUpload(SESSION_ID, req, USERNAME))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Missing parts");
        }

        @Test
        @DisplayName("Should reject complete when duplicate partNumber is submitted")
        void shouldRejectWhenDuplicateParts() {
            MultipartUploadSession session = buildSession(UploadStatus.PENDING, 3);
            when(sessionStore.findById(SESSION_ID)).thenReturn(Optional.of(session));

            MultipartUploadCompleteRequest req = MultipartUploadCompleteRequest.builder()
                    .parts(List.of(
                            MultipartUploadPartDto.builder().partNumber(1).eTag("etag-1").build(),
                            MultipartUploadPartDto.builder().partNumber(1).eTag("etag-1b").build(),
                            MultipartUploadPartDto.builder().partNumber(2).eTag("etag-2").build()
                    ))
                    .build();

            assertThatThrownBy(() -> multipartService.completeMultipartUpload(SESSION_ID, req, USERNAME))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Duplicate partNumber");
        }

        @Test
        @DisplayName("Should reject complete when ETag is blank")
        void shouldRejectWhenETagBlank() {
            MultipartUploadSession session = buildSession(UploadStatus.PENDING, 2);
            when(sessionStore.findById(SESSION_ID)).thenReturn(Optional.of(session));

            MultipartUploadCompleteRequest req = MultipartUploadCompleteRequest.builder()
                    .parts(List.of(
                            MultipartUploadPartDto.builder().partNumber(1).eTag("etag-1").build(),
                            MultipartUploadPartDto.builder().partNumber(2).eTag("").build()
                    ))
                    .build();

            assertThatThrownBy(() -> multipartService.completeMultipartUpload(SESSION_ID, req, USERNAME))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("ETag must not be blank");
        }
    }

    // ==================== ABORT TESTS ====================

    @Nested
    @DisplayName("abortMultipartUpload Tests")
    class AbortTests {

        @Test
        @DisplayName("Should abort multipart upload on S3 and update DB entity")
        void shouldAbortMultipartUpload() {
            MultipartUploadSession session = buildSession(UploadStatus.PENDING, 3);
            when(sessionStore.findById(SESSION_ID)).thenReturn(Optional.of(session));

            FileUploadEntity entity = FileUploadEntity.builder()
                    .objectKey(session.getFullObjectKey())
                    .status(UploadStatus.PENDING)
                    .build();
            when(fileUploadRepository.findByObjectKey(session.getFullObjectKey())).thenReturn(Optional.of(entity));

            multipartService.abortMultipartUpload(SESSION_ID, USERNAME);

            verify(s3Client).abortMultipartUpload(any(AbortMultipartUploadRequest.class));
            assertThat(entity.getStatus()).isEqualTo(UploadStatus.FAILED);
            verify(fileUploadRepository).save(entity);
            assertThat(session.getStatus()).isEqualTo(UploadStatus.FAILED);
        }

        @Test
        @DisplayName("Should handle repeated abort gracefully (idempotency)")
        void shouldHandleRepeatedAbortGracefully() {
            MultipartUploadSession session = buildSession(UploadStatus.FAILED, 3);
            when(sessionStore.findById(SESSION_ID)).thenReturn(Optional.of(session));

            multipartService.abortMultipartUpload(SESSION_ID, USERNAME);

            verifyNoInteractions(s3Client);
            verifyNoInteractions(fileUploadRepository);
        }

        @Test
        @DisplayName("Should reject abort on already completed upload session")
        void shouldRejectAbortOnCompletedSession() {
            MultipartUploadSession session = buildSession(UploadStatus.COMPLETED, 3);
            when(sessionStore.findById(SESSION_ID)).thenReturn(Optional.of(session));

            assertThatThrownBy(() -> multipartService.abortMultipartUpload(SESSION_ID, USERNAME))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Cannot abort an already completed");
        }
    }

    // ==================== STATUS TESTS ====================

    @Nested
    @DisplayName("getMultipartUploadStatus Tests")
    class StatusTests {

        @Test
        @DisplayName("Should return status and list of uploaded parts from S3")
        void shouldReturnStatusWithUploadedParts() {
            MultipartUploadSession session = buildSession(UploadStatus.PENDING, 5);
            when(sessionStore.findById(SESSION_ID)).thenReturn(Optional.of(session));

            ListPartsResponse listPartsResponse = ListPartsResponse.builder()
                    .parts(
                            Part.builder().partNumber(1).build(),
                            Part.builder().partNumber(3).build(),
                            Part.builder().partNumber(2).build()
                    )
                    .build();
            when(s3Client.listParts(any(ListPartsRequest.class))).thenReturn(listPartsResponse);

            MultipartUploadStatusResponse response = multipartService.getMultipartUploadStatus(SESSION_ID, USERNAME);

            assertThat(response).isNotNull();
            assertThat(response.getSessionId()).isEqualTo(SESSION_ID);
            assertThat(response.getStatus()).isEqualTo(UploadStatus.PENDING);
            assertThat(response.getTotalParts()).isEqualTo(5);
            assertThat(response.getUploadedParts()).containsExactly(1, 2, 3);
        }
    }
}
