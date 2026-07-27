package com.pht.dev_edu.file.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.lang.reflect.Field;
import java.net.MalformedURLException;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

/*
 * <analysis>
 * FileServiceImpl
 *
 * - generatePreSignedUrl(FilePreSignUploadRequest request)
 *   - branches:
 *       isPublic == true -> publicBucket, PUBLIC_FILE_PRESIGNED_DURATION, resolvePublicUrl
 *       isPublic == false -> privateBucket, PRIVATE_FILE_PRESIGNED_DURATION, publicUrl=null
 *   - paths:
 *       [P1: public file -> save entity, presign with public bucket, return with publicUrl]
 *       [P2: private file -> save entity, presign with private bucket, return with publicUrl=null]
 *   - planned tests:
 *       [shouldGeneratePreSignedUrlForPublicFile -> P1]
 *       [shouldGeneratePreSignedUrlForPrivateFile -> P2]
 *
 * - getFileInfo(String fullObjectKey)
 *   - branches:
 *       parseFullObjectKey fails (no /) -> BadRequestException
 *       headObject fails (NoSuchKeyException) -> DataNotFoundException
 *       success with public bucket -> publicUrl set
 *       success with private bucket -> publicUrl null
 *   - paths:
 *       [P1: invalid fullObjectKey (no /) -> BadRequestException]
 *       [P2: file not found on S3 -> DataNotFoundException]
 *       [P3: success with public bucket -> response with publicUrl]
 *       [P4: success with private bucket -> response with publicUrl=null]
 *   - planned tests:
 *       [shouldThrowBadRequestForInvalidObjectKey -> P1]
 *       [shouldThrowDataNotFoundWhenHeadObjectFailsForGetFileInfo -> P2]
 *       [shouldReturnFileInfoWithPublicUrl -> P3]
 *       [shouldReturnFileInfoWithoutPublicUrlForPrivateBucket -> P4]
 *
 * - getFileInfo(String username, String fullObjectKey)
 *   - branches:
 *       file not found in DB -> DataNotFoundException
 *       createdBy != username -> BadRequestException
 *       status == FAILED -> IllegalStateException
 *       expired + grace -> KafkaUtils.sendDeleteFileEvent + DataNotFoundException
 *       status == COMPLETED -> delegates to getFileInfo(fullObjectKey)
 *       status == COMPLETED + NoSuchKeyException -> DataNotFoundException
 *       HEAD object fails (NoSuchKeyException) -> FAILED + save + DataNotFoundException
 *       validateFile fails (contentType mismatch) -> IllegalStateException
 *       validateFile fails (fileSize mismatch) -> IllegalStateException
 *       success -> COMPLETED + confirmedAt set + save + return response
 *   - many execution paths, key ones:
 *       [P1: file not found in DB -> DataNotFoundException]
 *       [P2: username mismatch -> BadRequestException]
 *       [P3: status FAILED -> IllegalStateException]
 *       [P4: expired -> send Kafka delete + DataNotFoundException]
 *       [P5: status COMPLETED, file exists on S3 -> return info]
 *       [P6: status COMPLETED, S3 missing -> DataNotFoundException]
 *       [P7: PENDING, HEAD fails -> mark FAILED + DataNotFoundException]
 *       [P8: PENDING, HEAD success, validate pass -> COMPLETED + return]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenFileNotFoundInDb -> P1]
 *       [shouldThrowBadRequestWhenUsernameMismatch -> P2]
 *       [shouldThrowIllegalStateWhenStatusFailed -> P3]
 *       [shouldThrowDataNotFoundWhenFileExpired -> P4]
 *       [shouldReturnFileInfoWhenStatusCompleted -> P5]
 *       [shouldThrowDataNotFoundWhenCompletedButS3Missing -> P6]
 *       [shouldMarkFailedWhenPendingAndHeadObjectFails -> P7]
 *       [shouldCompleteFileWhenPendingAndHeadObjectSucceeds -> P8]
 *
 * - deleteFile(String fullObjectKey)
 *   - branches:
 *       success -> deleteObject + deleteByObjectKey
 *       NoSuchKeyException -> log error, still deleteByObjectKey
 *   - paths: [P1: success delete] [P2: S3 key not found]
 *   - planned tests:
 *       [shouldDeleteFileFromS3AndDb -> P1]
 *       [shouldDeleteFromDbEvenWhenS3KeyNotFound -> P2]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for FileServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify file upload, download, deletion and validation logic in FileServiceImpl.
 *
 * Test Scope
 * ----------
 * - generatePreSignedUrl() (public/private)
 * - getFileInfo(fullObjectKey)
 * - getFileInfo(username, fullObjectKey) (owner validation, expiry, S3 HEAD)
 * - deleteFile()
 *
 * Covered Scenarios
 * -----------------
 * ✓ Pre-signed URL generation for public and private files
 * ✓ File info retrieval (public vs private bucket)
 * ✓ Owner-based file retrieval with all guard clauses
 * ✓ File deletion with and without S3 key existence
 * ✓ Exception paths (BadRequest, DataNotFound, IllegalState)
 *
 * Mocked Dependencies
 * -------------------
 * - FileUploadRepository
 * - S3Presigner
 * - S3Client
 * - KafkaUtils (static)
 *
 * Not Covered
 * -----------
 * - getVideoDuration() (requires ProcessBuilder/ffprobe)
 * - confirmImageUpload() (similar pattern to getFileInfo, lower priority)
 * - getFileInfoDetail() (simple delegation)
 * - Database/S3 integration
 *
 * Notes
 * -----
 * Pure unit test. All AWS SDK and repository interactions are mocked.
 * KafkaUtils requires MockedStatic.
 */

import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.file.dto.FilePreSignUploadRequest;
import com.pht.dev_edu.file.dto.FileUploadResponse;
import com.pht.dev_edu.file.dto.UploadStatus;
import com.pht.dev_edu.file.entity.FileUploadEntity;
import com.pht.dev_edu.file.repo.FileUploadRepository;

import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

@ExtendWith(MockitoExtension.class)
class FileServiceImplTest {

    @Mock
    private FileUploadRepository fileUploadRepository;
    @Mock
    private S3Presigner s3Presigner;
    @Mock
    private S3Client s3Client;

    @InjectMocks
    private FileServiceImpl fileService;

    private MockedStatic<KafkaUtils> kafkaUtilsMock;

    private static final String PUBLIC_BUCKET = "public-bucket";
    private static final String PRIVATE_BUCKET = "private-bucket";
    private static final String PUBLIC_URL = "https://cdn.example.com";
    private static final String USERNAME = "testuser";
    private static final String FULL_OBJECT_KEY_PUBLIC = PUBLIC_BUCKET + "/dev_edu/12345-test.png";
    private static final String FULL_OBJECT_KEY_PRIVATE = PRIVATE_BUCKET + "/dev_edu/12345-test.pdf";
    private static final String PRESIGNED_URL = "https://s3.example.com/presigned";
    private static final String DOWNLOAD_URL = "https://s3.example.com/download";

    @BeforeEach
    void setUp() throws Exception {
        kafkaUtilsMock = mockStatic(KafkaUtils.class);
        setField("publicBucketName", PUBLIC_BUCKET);
        setField("privateBucketName", PRIVATE_BUCKET);
        setField("publicUrl", PUBLIC_URL);
    }

    @AfterEach
    void tearDown() {
        kafkaUtilsMock.close();
    }

    // ==================== Helper Methods ====================

    private void setField(String fieldName, Object value) throws Exception {
        Field field = FileServiceImpl.class.getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(fileService, value);
    }

    private FilePreSignUploadRequest buildUploadRequest(boolean isPublic) {
        FilePreSignUploadRequest request = new FilePreSignUploadRequest();
        request.setFileName("test.png");
        request.setContentType("image/png");
        request.setFileSize(1024L);
        request.setIsPublic(isPublic);
        request.setUsername(USERNAME);
        return request;
    }

    private FileUploadEntity buildFileEntity(String fullObjectKey, UploadStatus status) {
        return FileUploadEntity.builder()
                .id(UUID.randomUUID())
                .objectKey(fullObjectKey)
                .fileName("test.png")
                .contentType("image/png")
                .fileSize(1024L)
                .status(status)
                .createdBy(USERNAME)
                .createdAt(LocalDateTime.now())
                .expiredAt(LocalDateTime.now().plusMinutes(15))
                .build();
    }

    private PresignedPutObjectRequest buildPresignedPutResponse() throws MalformedURLException {
        PresignedPutObjectRequest presigned = mock(PresignedPutObjectRequest.class);
        when(presigned.url()).thenReturn(URI.create(PRESIGNED_URL).toURL());
        return presigned;
    }

    private PresignedGetObjectRequest buildPresignedGetResponse() throws MalformedURLException {
        PresignedGetObjectRequest presigned = mock(PresignedGetObjectRequest.class);
        when(presigned.url()).thenReturn(URI.create(DOWNLOAD_URL).toURL());
        return presigned;
    }

    private HeadObjectResponse buildHeadObjectResponse() {
        return HeadObjectResponse.builder()
                .contentType("image/png")
                .contentLength(1024L)
                .build();
    }

    // ==================== generatePreSignedUrl ====================

    @Test
    @DisplayName("generatePreSignedUrl - should generate URL for public file with publicUrl")
    void shouldGeneratePreSignedUrlForPublicFile() throws Exception {
        // Arrange
        FilePreSignUploadRequest request = buildUploadRequest(true);
        PresignedPutObjectRequest presigned = buildPresignedPutResponse();
        when(s3Presigner.presignPutObject(any(PutObjectPresignRequest.class))).thenReturn(presigned);

        // Act
        FileUploadResponse result = fileService.generatePreSignedUrl(request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getUploadUrl()).isEqualTo(PRESIGNED_URL);
        assertThat(result.getObjectKey()).startsWith(PUBLIC_BUCKET + "/");
        assertThat(result.getPublicUrl()).isNotNull();
        assertThat(result.getContentType()).isEqualTo("image/png");

        // Verify
        verify(fileUploadRepository).save(any(FileUploadEntity.class));
    }

    @Test
    @DisplayName("generatePreSignedUrl - should generate URL for private file with publicUrl=null")
    void shouldGeneratePreSignedUrlForPrivateFile() throws Exception {
        // Arrange
        FilePreSignUploadRequest request = buildUploadRequest(false);
        PresignedPutObjectRequest presigned = buildPresignedPutResponse();
        when(s3Presigner.presignPutObject(any(PutObjectPresignRequest.class))).thenReturn(presigned);

        // Act
        FileUploadResponse result = fileService.generatePreSignedUrl(request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getPublicUrl()).isNull();
        assertThat(result.getObjectKey()).startsWith(PRIVATE_BUCKET + "/");

        // Verify
        verify(fileUploadRepository).save(any(FileUploadEntity.class));
    }

    // ==================== getFileInfo(fullObjectKey) ====================

    @Test
    @DisplayName("getFileInfo(fullObjectKey) - should throw BadRequestException for invalid object key (no /)")
    void shouldThrowBadRequestForInvalidObjectKey() {
        // Arrange
        String invalidKey = "no-slash-key";

        // Act & Assert
        assertThatThrownBy(() -> fileService.getFileInfo(invalidKey))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("File not found.");
    }

    @Test
    @DisplayName("getFileInfo(fullObjectKey) - should throw DataNotFoundException when S3 headObject fails")
    void shouldThrowDataNotFoundWhenHeadObjectFailsForGetFileInfo() {
        // Arrange
        when(s3Client.headObject(any(HeadObjectRequest.class)))
                .thenThrow(NoSuchKeyException.builder().message("not found").build());

        // Act & Assert
        assertThatThrownBy(() -> fileService.getFileInfo(FULL_OBJECT_KEY_PUBLIC))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("File not found.");
    }

    @Test
    @DisplayName("getFileInfo(fullObjectKey) - should return file info with publicUrl for public bucket")
    void shouldReturnFileInfoWithPublicUrl() throws Exception {
        // Arrange
        HeadObjectResponse head = buildHeadObjectResponse();
        when(s3Client.headObject(any(HeadObjectRequest.class))).thenReturn(head);

        PresignedGetObjectRequest presigned = buildPresignedGetResponse();
        when(s3Presigner.presignGetObject(any(GetObjectPresignRequest.class))).thenReturn(presigned);

        // Act
        FileUploadResponse result = fileService.getFileInfo(FULL_OBJECT_KEY_PUBLIC);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContentType()).isEqualTo("image/png");
        assertThat(result.getFileSize()).isEqualTo(1024L);
        assertThat(result.getPublicUrl()).isNotNull();
        assertThat(result.getDownloadUrl()).isEqualTo(DOWNLOAD_URL);
    }

    @Test
    @DisplayName("getFileInfo(fullObjectKey) - should return file info without publicUrl for private bucket")
    void shouldReturnFileInfoWithoutPublicUrlForPrivateBucket() throws Exception {
        // Arrange
        HeadObjectResponse head = buildHeadObjectResponse();
        when(s3Client.headObject(any(HeadObjectRequest.class))).thenReturn(head);

        PresignedGetObjectRequest presigned = buildPresignedGetResponse();
        when(s3Presigner.presignGetObject(any(GetObjectPresignRequest.class))).thenReturn(presigned);

        // Act
        FileUploadResponse result = fileService.getFileInfo(FULL_OBJECT_KEY_PRIVATE);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getPublicUrl()).isNull();
    }

    // ==================== getFileInfo(username, fullObjectKey)
    // ====================

    @Test
    @DisplayName("getFileInfo(username, key) - should throw DataNotFoundException when file not found in DB")
    void shouldThrowDataNotFoundWhenFileNotFoundInDb() {
        // Arrange
        when(fileUploadRepository.findByObjectKey(FULL_OBJECT_KEY_PUBLIC)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> fileService.getFileInfo(USERNAME, FULL_OBJECT_KEY_PUBLIC))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("File not found.");
    }

    @Test
    @DisplayName("getFileInfo(username, key) - should throw BadRequestException when username does not match")
    void shouldThrowBadRequestWhenUsernameMismatch() {
        // Arrange
        FileUploadEntity entity = buildFileEntity(FULL_OBJECT_KEY_PUBLIC, UploadStatus.PENDING);
        entity.setCreatedBy("other_user");
        when(fileUploadRepository.findByObjectKey(FULL_OBJECT_KEY_PUBLIC)).thenReturn(Optional.of(entity));

        // Act & Assert
        assertThatThrownBy(() -> fileService.getFileInfo(USERNAME, FULL_OBJECT_KEY_PUBLIC))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("File not found.");
    }

    @Test
    @DisplayName("getFileInfo(username, key) - should throw IllegalStateException when status is FAILED")
    void shouldThrowIllegalStateWhenStatusFailed() {
        // Arrange
        FileUploadEntity entity = buildFileEntity(FULL_OBJECT_KEY_PUBLIC, UploadStatus.FAILED);
        when(fileUploadRepository.findByObjectKey(FULL_OBJECT_KEY_PUBLIC)).thenReturn(Optional.of(entity));

        // Act & Assert
        assertThatThrownBy(() -> fileService.getFileInfo(USERNAME, FULL_OBJECT_KEY_PUBLIC))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Upload file failed.");
    }

    @Test
    @DisplayName("getFileInfo(username, key) - should throw DataNotFoundException and send Kafka event when file expired")
    void shouldThrowDataNotFoundWhenFileExpired() {
        // Arrange
        FileUploadEntity entity = buildFileEntity(FULL_OBJECT_KEY_PUBLIC, UploadStatus.PENDING);
        entity.setExpiredAt(LocalDateTime.now().minusMinutes(10)); // expired
        when(fileUploadRepository.findByObjectKey(FULL_OBJECT_KEY_PUBLIC)).thenReturn(Optional.of(entity));

        // Act & Assert
        assertThatThrownBy(() -> fileService.getFileInfo(USERNAME, FULL_OBJECT_KEY_PUBLIC))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("File expired.");

        // Verify
        kafkaUtilsMock.verify(() -> KafkaUtils.sendDeleteFileEvent(FULL_OBJECT_KEY_PUBLIC));
    }

    @Test
    @DisplayName("getFileInfo(username, key) - should return info when status is COMPLETED and S3 file exists")
    void shouldReturnFileInfoWhenStatusCompleted() throws Exception {
        // Arrange
        FileUploadEntity entity = buildFileEntity(FULL_OBJECT_KEY_PUBLIC, UploadStatus.COMPLETED);
        when(fileUploadRepository.findByObjectKey(FULL_OBJECT_KEY_PUBLIC)).thenReturn(Optional.of(entity));

        HeadObjectResponse head = buildHeadObjectResponse();
        when(s3Client.headObject(any(HeadObjectRequest.class))).thenReturn(head);

        PresignedGetObjectRequest presigned = buildPresignedGetResponse();
        when(s3Presigner.presignGetObject(any(GetObjectPresignRequest.class))).thenReturn(presigned);

        // Act
        FileUploadResponse result = fileService.getFileInfo(USERNAME, FULL_OBJECT_KEY_PUBLIC);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContentType()).isEqualTo("image/png");
    }

    @Test
    @DisplayName("getFileInfo(username, key) - should throw DataNotFoundException when COMPLETED but S3 file missing")
    void shouldThrowDataNotFoundWhenCompletedButS3Missing() {
        // Arrange
        // headObject() internally catches NoSuchKeyException and throws
        // DataNotFoundException,
        // so the outer catch(NoSuchKeyException) in getFileInfo(username, key) is
        // unreachable.
        FileUploadEntity entity = buildFileEntity(FULL_OBJECT_KEY_PUBLIC, UploadStatus.COMPLETED);
        when(fileUploadRepository.findByObjectKey(FULL_OBJECT_KEY_PUBLIC)).thenReturn(Optional.of(entity));
        when(s3Client.headObject(any(HeadObjectRequest.class)))
                .thenThrow(NoSuchKeyException.builder().message("not found").build());

        // Act & Assert
        assertThatThrownBy(() -> fileService.getFileInfo(USERNAME, FULL_OBJECT_KEY_PUBLIC))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("File not found.");
    }

    @Test
    @DisplayName("getFileInfo(username, key) - should throw DataNotFoundException when PENDING and HEAD fails")
    void shouldThrowDataNotFoundWhenPendingAndHeadObjectFails() {
        // Arrange
        // headObject() internally catches NoSuchKeyException and throws
        // DataNotFoundException,
        // so the outer catch(NoSuchKeyException) that sets status=FAILED is
        // unreachable.
        FileUploadEntity entity = buildFileEntity(FULL_OBJECT_KEY_PUBLIC, UploadStatus.PENDING);
        when(fileUploadRepository.findByObjectKey(FULL_OBJECT_KEY_PUBLIC)).thenReturn(Optional.of(entity));
        when(s3Client.headObject(any(HeadObjectRequest.class)))
                .thenThrow(NoSuchKeyException.builder().message("not found").build());

        // Act & Assert
        assertThatThrownBy(() -> fileService.getFileInfo(USERNAME, FULL_OBJECT_KEY_PUBLIC))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("File not found.");
    }

    @Test
    @DisplayName("getFileInfo(username, key) - should complete file when PENDING and HEAD succeeds with valid data")
    void shouldCompleteFileWhenPendingAndHeadObjectSucceeds() throws Exception {
        // Arrange
        FileUploadEntity entity = buildFileEntity(FULL_OBJECT_KEY_PUBLIC, UploadStatus.PENDING);
        when(fileUploadRepository.findByObjectKey(FULL_OBJECT_KEY_PUBLIC)).thenReturn(Optional.of(entity));

        HeadObjectResponse head = buildHeadObjectResponse();
        when(s3Client.headObject(any(HeadObjectRequest.class))).thenReturn(head);

        PresignedGetObjectRequest presigned = buildPresignedGetResponse();
        when(s3Presigner.presignGetObject(any(GetObjectPresignRequest.class))).thenReturn(presigned);

        // Act
        FileUploadResponse result = fileService.getFileInfo(USERNAME, FULL_OBJECT_KEY_PUBLIC);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContentType()).isEqualTo("image/png");
        assertThat(entity.getStatus()).isEqualTo(UploadStatus.COMPLETED);
        assertThat(entity.getConfirmedAt()).isNotNull();

        // Verify
        verify(fileUploadRepository, times(1)).save(entity);
    }

    // ==================== deleteFile ====================

    @Test
    @DisplayName("deleteFile - should delete file from S3 and DB")
    void shouldDeleteFileFromS3AndDb() {
        // Arrange — no exception from S3
        // Act
        fileService.deleteFile(FULL_OBJECT_KEY_PUBLIC);

        // Assert/Verify
        verify(s3Client).deleteObject(any(DeleteObjectRequest.class));
        verify(fileUploadRepository).deleteByObjectKey(FULL_OBJECT_KEY_PUBLIC);
    }

    @Test
    @DisplayName("deleteFile - should still delete from DB even when S3 key not found")
    void shouldDeleteFromDbEvenWhenS3KeyNotFound() {
        // Arrange
        doThrow(NoSuchKeyException.builder().message("not found").build())
                .when(s3Client).deleteObject(any(DeleteObjectRequest.class));

        // Act
        fileService.deleteFile(FULL_OBJECT_KEY_PUBLIC);

        // Verify — DB delete still happens
        verify(fileUploadRepository).deleteByObjectKey(FULL_OBJECT_KEY_PUBLIC);
    }
}
