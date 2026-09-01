package com.pht.dev_edu.file.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.file.dto.*;
import com.pht.dev_edu.file.service.FileMultipartService;
import com.pht.dev_edu.file.service.FileService;

@ExtendWith(MockitoExtension.class)
class FileControllerTest {

    @Mock
    private FileService fileService;

    @Mock
    private FileMultipartService fileMultipartService;

    @InjectMocks
    private FileController fileController;

    private MockedStatic<SecurityContextUtils> securityContextMock;

    private static final String USERNAME = "testuser";
    private static final String SESSION_ID = "session-12345";
    private static final String OBJECT_KEY = "public-bucket/dev_edu/123-file.png";

    @BeforeEach
    void setUp() {
        securityContextMock = mockStatic(SecurityContextUtils.class);
        securityContextMock.when(SecurityContextUtils::getCurrentUsername).thenReturn(USERNAME);
        securityContextMock.when(SecurityContextUtils::getCurrentUsernameForController).thenReturn(USERNAME);
    }

    @AfterEach
    void tearDown() {
        securityContextMock.close();
    }

    // ==================== Existing Endpoints ====================\

    @Test
    @DisplayName("uploadFile - should delegate to FileService.generatePreSignedUrl")
    void shouldUploadFileSuccessfully() {
        FilePreSignUploadRequest req = new FilePreSignUploadRequest();
        req.setFileName("test.png");
        req.setContentType("image/png");
        req.setFileSize(1024L);

        FileUploadResponse expected = FileUploadResponse.builder()
                .uploadUrl("https://s3.example.com/upload")
                .objectKey(OBJECT_KEY)
                .build();

        when(fileService.generatePreSignedUrl(any(FilePreSignUploadRequest.class))).thenReturn(expected);

        ResponseEntity<ApiResponse> response = fileController.uploadFile(req);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).isEqualTo(expected);
        verify(fileService).generatePreSignedUrl(req);
    }

    @Test
    @DisplayName("getFileInfo - should delegate to FileService.getFileInfoDetail")
    void shouldGetFileInfoDetail() {
        FileUploadResponse expected = FileUploadResponse.builder().objectKey(OBJECT_KEY).build();
        when(fileService.getFileInfoDetail(OBJECT_KEY)).thenReturn(expected);

        ResponseEntity<ApiResponse> response = fileController.getFileInfo(OBJECT_KEY);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getData()).isEqualTo(expected);
        verify(fileService).getFileInfoDetail(OBJECT_KEY);
    }

    @Test
    @DisplayName("getDownloadInfo - should delegate to FileService.getFileInfo")
    void shouldGetDownloadInfo() {
        FileUploadResponse expected = FileUploadResponse.builder().downloadUrl("https://download").build();
        when(fileService.getFileInfo(OBJECT_KEY)).thenReturn(expected);

        ResponseEntity<ApiResponse> response = fileController.getDownloadInfo(OBJECT_KEY);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getData()).isEqualTo(expected);
        verify(fileService).getFileInfo(OBJECT_KEY);
    }

    @Test
    @DisplayName("confirmImageUpload - should delegate to FileService.confirmImageUpload")
    void shouldConfirmImageUpload() {
        String expectedUrl = "https://cdn.example.com/image.png";
        when(fileService.confirmImageUpload(USERNAME, OBJECT_KEY)).thenReturn(expectedUrl);

        ResponseEntity<ApiResponse> response = fileController.confirmImageUpload(OBJECT_KEY);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getData()).isEqualTo(expectedUrl);
        verify(fileService).confirmImageUpload(USERNAME, OBJECT_KEY);
    }

    // ==================== Chunked / Multipart Upload Endpoints ====================\

    @Test
    @DisplayName("initChunkUpload - should delegate to FileMultipartService.initMultipartUpload")
    void shouldInitChunkUpload() {
        MultipartUploadInitRequest req = MultipartUploadInitRequest.builder()
                .fileName("large.mp4")
                .contentType("video/mp4")
                .fileSize(100L * 1024 * 1024)
                .isPublic(true)
                .build();

        MultipartUploadInitResponse expected = MultipartUploadInitResponse.builder()
                .sessionId(SESSION_ID)
                .chunkSize(20L * 1024 * 1024)
                .totalParts(5)
                .windowSize(20)
                .concurrency(5)
                .objectKey(OBJECT_KEY)
                .build();

        when(fileMultipartService.initMultipartUpload(any(MultipartUploadInitRequest.class))).thenReturn(expected);

        ResponseEntity<ApiResponse> response = fileController.initChunkUpload(req);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).isEqualTo(expected);
        assertThat(req.getUsername()).isEqualTo(USERNAME);
        verify(fileMultipartService).initMultipartUpload(req);
    }

    @Test
    @DisplayName("presignChunkParts - should delegate to FileMultipartService.presignMultipartParts")
    void shouldPresignChunkParts() {
        MultipartUploadPresignRequest req = MultipartUploadPresignRequest.builder().fromPart(1).build();

        MultipartUploadPresignResponse expected = MultipartUploadPresignResponse.builder()
                .sessionId(SESSION_ID)
                .parts(List.of(
                        PresignedPartDto.builder().partNumber(1).presignedUrl("https://part1").expiresAt(LocalDateTime.now().plusMinutes(30)).build()
                ))
                .build();

        when(fileMultipartService.presignMultipartParts(eq(SESSION_ID), eq(req), eq(USERNAME))).thenReturn(expected);

        ResponseEntity<ApiResponse> response = fileController.presignChunkParts(SESSION_ID, req);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getData()).isEqualTo(expected);
        verify(fileMultipartService).presignMultipartParts(SESSION_ID, req, USERNAME);
    }

    @Test
    @DisplayName("completeChunkUpload - should delegate to FileMultipartService.completeMultipartUpload")
    void shouldCompleteChunkUpload() {
        MultipartUploadCompleteRequest req = MultipartUploadCompleteRequest.builder()
                .parts(List.of(MultipartUploadPartDto.builder().partNumber(1).eTag("etag1").build()))
                .build();

        FileUploadResponse expected = FileUploadResponse.builder()
                .objectKey(OBJECT_KEY)
                .downloadUrl("https://download")
                .build();

        when(fileMultipartService.completeMultipartUpload(eq(SESSION_ID), eq(req), eq(USERNAME))).thenReturn(expected);

        ResponseEntity<ApiResponse> response = fileController.completeChunkUpload(SESSION_ID, req);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getData()).isEqualTo(expected);
        verify(fileMultipartService).completeMultipartUpload(SESSION_ID, req, USERNAME);
    }

    @Test
    @DisplayName("completeChunkUpload - should deserialize JSON eTag correctly with Jackson")
    void shouldDeserializeCompleteRequestJsonCorrectly() throws Exception {
        String json = "{\"parts\":[{\"partNumber\":1,\"eTag\":\"bf75620b0f84f6f0cf70daf436059b93\"},{\"partNumber\":2,\"etag\":\"bcb27932a6c75011151642bf1ecffd40\"}]}";
        ObjectMapper mapper = new ObjectMapper();
        MultipartUploadCompleteRequest req = mapper.readValue(json, MultipartUploadCompleteRequest.class);

        assertThat(req.getParts()).hasSize(2);
        assertThat(req.getParts().get(0).getPartNumber()).isEqualTo(1);
        assertThat(req.getParts().get(0).getETag()).isEqualTo("bf75620b0f84f6f0cf70daf436059b93");
        assertThat(req.getParts().get(1).getPartNumber()).isEqualTo(2);
        assertThat(req.getParts().get(1).getETag()).isEqualTo("bcb27932a6c75011151642bf1ecffd40");
    }

    @Test
    @DisplayName("abortChunkUpload - should delegate to FileMultipartService.abortMultipartUpload")
    void shouldAbortChunkUpload() {
        doNothing().when(fileMultipartService).abortMultipartUpload(SESSION_ID, USERNAME);

        ResponseEntity<ApiResponse> response = fileController.abortChunkUpload(SESSION_ID);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(fileMultipartService).abortMultipartUpload(SESSION_ID, USERNAME);
    }

    @Test
    @DisplayName("getChunkUploadStatus - should delegate to FileMultipartService.getMultipartUploadStatus")
    void shouldGetChunkUploadStatus() {
        MultipartUploadStatusResponse expected = MultipartUploadStatusResponse.builder()
                .sessionId(SESSION_ID)
                .status(UploadStatus.PENDING)
                .totalParts(5)
                .uploadedParts(List.of(1, 2))
                .build();

        when(fileMultipartService.getMultipartUploadStatus(eq(SESSION_ID), eq(USERNAME))).thenReturn(expected);

        ResponseEntity<ApiResponse> response = fileController.getChunkUploadStatus(SESSION_ID);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getData()).isEqualTo(expected);
        verify(fileMultipartService).getMultipartUploadStatus(SESSION_ID, USERNAME);
    }
}
