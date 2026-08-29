package com.pht.dev_edu.quiz.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.file.dto.FileUploadResponse;
import com.pht.dev_edu.file.dto.UploadStatus;
import com.pht.dev_edu.file.entity.FileUploadEntity;
import com.pht.dev_edu.file.repo.FileUploadRepository;
import com.pht.dev_edu.file.service.FileService;
import com.pht.dev_edu.quiz.dto.enums.DocumentStatus;
import com.pht.dev_edu.quiz.dto.enums.DocumentVisibility;
import com.pht.dev_edu.quiz.dto.response.CourseDocumentResponse;
import com.pht.dev_edu.quiz.engine.DocumentProcessingService;
import com.pht.dev_edu.quiz.entity.CourseDocumentEntity;
import com.pht.dev_edu.quiz.repo.CourseDocumentRepository;

/*
 * <analysis>
 * CourseDocumentServiceImpl
 * - getGlobalDocumentLibrary(String nextCursor, String fileName)
 *   - paths:
 *       [P1: retrieves global documents from repository and returns cursor-based pagination]
 *   - planned tests:
 *       [shouldReturnGlobalDocumentLibraryWithCursorPagination -> P1]
 *
 * - uploadGlobalDocumentByAdmin(MultipartFile file, String title, String username)
 *   - branches:
 *       file is null or empty -> BadRequestException
 *       file is not PDF -> BadRequestException
 *       valid PDF file -> uploads to private bucket, confirms file_upload, saves document and processes chunks immediately
 *   - paths:
 *       [P1: empty file -> BadRequestException]
 *       [P2: non-PDF file -> BadRequestException]
 *       [P3: valid PDF file -> uploads to private bucket and syncs embeddings immediately]
 *   - planned tests:
 *       [shouldThrowBadRequestWhenAdminUploadFileIsEmpty -> P1]
 *       [shouldThrowBadRequestWhenAdminUploadFileIsNotPdf -> P2]
 *       [shouldUploadGlobalDocumentToPrivateBucketAndProcessEmbeddingsImmediately -> P3]
 *
 * - deleteGlobalDocument(UUID documentId, String username)
 *   - branches:
 *       document not found -> DataNotFoundException
 *       document found -> sets deletedAt timestamp and saves
 *   - paths:
 *       [P1: document not found -> DataNotFoundException]
 *       [P2: document found -> soft deletes document]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenDeletingNonExistentDocument -> P1]
 *       [shouldSoftDeleteGlobalDocumentSuccessfully -> P2]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for CourseDocumentServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify document library retrieval, admin direct upload to private bucket with immediate
 * chunk/embedding processing, and soft-delete operations in CourseDocumentServiceImpl.
 *
 * Test Scope
 * ----------
 * - getGlobalDocumentLibrary(String, String)
 * - uploadGlobalDocumentByAdmin(MultipartFile, String, String)
 * - deleteGlobalDocument(UUID, String)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Global document cursor pagination
 * ✓ Empty file rejection on admin upload (BadRequestException)
 * ✓ Non-PDF extension rejection on admin upload (BadRequestException)
 * ✓ Private bucket storage upload & immediate embedding sync upon admin upload
 * ✓ Missing document soft delete handling (DataNotFoundException)
 * ✓ Successful soft deletion with deletedAt timestamp
 *
 * Mocked Dependencies
 * -------------------
 * - CourseDocumentRepository
 * - DocumentProcessingService
 * - FileService
 * - FileUploadRepository
 */
@ExtendWith(MockitoExtension.class)
class CourseDocumentServiceImplTest {

    @Mock
    private CourseDocumentRepository documentRepository;

    @Mock
    private DocumentProcessingService documentProcessingService;

    @Mock
    private FileService fileService;

    @Mock
    private FileUploadRepository fileUploadRepository;

    @InjectMocks
    private CourseDocumentServiceImpl courseDocumentService;

    private static final String ADMIN_USER = "admin_super";
    private static final UUID DOCUMENT_ID = UUID.randomUUID();

    @Test
    @DisplayName("getGlobalDocumentLibrary - should return cursor paginated list of global documents")
    void shouldReturnGlobalDocumentLibraryWithCursorPagination() {
        // Arrange
        CourseDocumentEntity doc1 = CourseDocumentEntity.builder()
                .id(UUID.randomUUID())
                .title("Operating Systems.pdf")
                .fileName("Operating Systems.pdf")
                .fileObjectKey("private-bucket/dev_edu/OS.pdf")
                .fileSize(1024L)
                .contentHash("hash1")
                .status(DocumentStatus.READY)
                .visibility(DocumentVisibility.GLOBAL)
                .createdBy(ADMIN_USER)
                .createdAt(LocalDateTime.now())
                .build();

        when(documentRepository.findGlobalDocumentsWithCursor(eq("Operating"), any(), any(), eq(16)))
                .thenReturn(List.of(doc1));

        // Act
        CustomPaging<CourseDocumentResponse> result = courseDocumentService.getGlobalDocumentLibrary(null, "Operating");

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContents()).hasSize(1);
        assertThat(result.getContents().iterator().next().getTitle()).isEqualTo("Operating Systems.pdf");
    }

    @Test
    @DisplayName("uploadGlobalDocumentByAdmin - should throw BadRequestException when file is empty")
    void shouldThrowBadRequestWhenAdminUploadFileIsEmpty() {
        // Arrange
        MockMultipartFile emptyFile = new MockMultipartFile("file", "empty.pdf", "application/pdf", new byte[0]);

        // Act & Assert
        assertThatThrownBy(() -> courseDocumentService.uploadGlobalDocumentByAdmin(emptyFile, "Title", ADMIN_USER))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("File is empty");
        verify(fileService, never()).uploadDirectFile(any(), any(Boolean.class), any());
    }

    @Test
    @DisplayName("uploadGlobalDocumentByAdmin - should throw BadRequestException when file is not PDF")
    void shouldThrowBadRequestWhenAdminUploadFileIsNotPdf() {
        // Arrange
        MockMultipartFile txtFile = new MockMultipartFile("file", "notes.txt", "text/plain", "Hello World".getBytes());

        // Act & Assert
        assertThatThrownBy(() -> courseDocumentService.uploadGlobalDocumentByAdmin(txtFile, "Title", ADMIN_USER))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Only PDF document files are allowed");
        verify(fileService, never()).uploadDirectFile(any(), any(Boolean.class), any());
    }

    @Test
    @DisplayName("uploadGlobalDocumentByAdmin - should upload to private bucket, confirm file_upload, and process embeddings immediately")
    void shouldUploadGlobalDocumentToPrivateBucketAndProcessEmbeddingsImmediately() {
        // Arrange
        byte[] pdfBytes = "%PDF-1.4 Mock PDF Content".getBytes();
        MockMultipartFile pdfFile = new MockMultipartFile("file", "Network.pdf", "application/pdf", pdfBytes);

        String privateObjectKey = "private-bucket/dev_edu/177000-Network.pdf";
        FileUploadResponse fileResp = FileUploadResponse.builder()
                .originalFileName("Network.pdf")
                .objectKey(privateObjectKey)
                .fileSize((long) pdfBytes.length)
                .build();
        when(fileService.uploadDirectFile(pdfFile, false, ADMIN_USER)).thenReturn(fileResp);

        FileUploadEntity fileUploadEntity = FileUploadEntity.builder()
                .objectKey(privateObjectKey)
                .status(UploadStatus.PENDING)
                .build();
        when(fileUploadRepository.findByObjectKey(privateObjectKey)).thenReturn(Optional.of(fileUploadEntity));

        CourseDocumentEntity savedDoc = CourseDocumentEntity.builder()
                .id(DOCUMENT_ID)
                .title("Computer Networks")
                .fileName("Network.pdf")
                .fileObjectKey(privateObjectKey)
                .fileSize((long) pdfBytes.length)
                .contentHash("hash123")
                .status(DocumentStatus.READY)
                .visibility(DocumentVisibility.GLOBAL)
                .createdBy(ADMIN_USER)
                .createdAt(LocalDateTime.now())
                .build();
        when(documentRepository.save(any(CourseDocumentEntity.class))).thenReturn(savedDoc);

        // Act
        CourseDocumentResponse response = courseDocumentService.uploadGlobalDocumentByAdmin(pdfFile, "Computer Networks", ADMIN_USER);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(DOCUMENT_ID);
        assertThat(response.getFileObjectKey()).isEqualTo(privateObjectKey);
        assertThat(fileUploadEntity.getStatus()).isEqualTo(UploadStatus.COMPLETED);
        assertThat(fileUploadEntity.getConfirmedAt()).isNotNull();

        verify(fileService).uploadDirectFile(pdfFile, false, ADMIN_USER);
        verify(fileUploadRepository).save(fileUploadEntity);
        verify(documentRepository).save(any(CourseDocumentEntity.class));
        verify(documentProcessingService).processAndStoreDocument(eq(savedDoc), any(InputStream.class));
    }

    @Test
    @DisplayName("deleteGlobalDocument - should throw DataNotFoundException when document not found")
    void shouldThrowDataNotFoundWhenDeletingNonExistentDocument() {
        // Arrange
        when(documentRepository.findByIdAndDeletedAtIsNull(DOCUMENT_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> courseDocumentService.deleteGlobalDocument(DOCUMENT_ID, ADMIN_USER))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Global document not found");
    }

    @Test
    @DisplayName("deleteGlobalDocument - should soft delete global document successfully")
    void shouldSoftDeleteGlobalDocumentSuccessfully() {
        // Arrange
        CourseDocumentEntity doc = CourseDocumentEntity.builder()
                .id(DOCUMENT_ID)
                .title("Algorithms.pdf")
                .status(DocumentStatus.READY)
                .visibility(DocumentVisibility.GLOBAL)
                .build();
        when(documentRepository.findByIdAndDeletedAtIsNull(DOCUMENT_ID)).thenReturn(Optional.of(doc));

        // Act
        courseDocumentService.deleteGlobalDocument(DOCUMENT_ID, ADMIN_USER);

        // Assert
        assertThat(doc.getDeletedAt()).isNotNull();
        verify(documentRepository).save(doc);
    }
}
