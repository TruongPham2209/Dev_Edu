package com.pht.dev_edu.quiz.engine;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import com.pht.dev_edu.quiz.dto.enums.DocumentStatus;
import com.pht.dev_edu.quiz.dto.enums.DocumentVisibility;
import com.pht.dev_edu.quiz.dto.request.GenerateQuizFromDocumentRequest;
import com.pht.dev_edu.quiz.entity.CourseDocumentEntity;
import com.pht.dev_edu.quiz.entity.DocumentUploadAuditEntity;
import com.pht.dev_edu.quiz.entity.QuizGenerationJobEntity;
import com.pht.dev_edu.quiz.repo.CourseDocumentRepository;
import com.pht.dev_edu.quiz.repo.DocumentUploadAuditRepository;

import com.pht.dev_edu.file.repo.FileUploadRepository;

class DocumentPromotionServiceTest {

        private CourseDocumentRepository mockDocRepo;
        private DocumentUploadAuditRepository mockAuditRepo;
        private FileUploadRepository mockFileUploadRepo;
        private DocumentPromotionServiceImpl promotionService;

        @BeforeEach
        void setUp() {
                mockDocRepo = Mockito.mock(CourseDocumentRepository.class);
                mockAuditRepo = Mockito.mock(DocumentUploadAuditRepository.class);
                mockFileUploadRepo = Mockito.mock(FileUploadRepository.class);
                promotionService = new DocumentPromotionServiceImpl(mockDocRepo, mockAuditRepo, mockFileUploadRepo);
        }

        @Test
        @DisplayName("Should promote document to GLOBAL library when saveRequested=true and Quiz generation succeeds")
        void testSavePolicy_PromoteToGlobalOnSuccess() {
                UUID jobId = UUID.randomUUID();
                UUID courseId = UUID.randomUUID();
                UUID quizId = UUID.randomUUID();

                QuizGenerationJobEntity job = QuizGenerationJobEntity.builder()
                                .id(jobId)
                                .courseId(courseId)
                                .acceptedCount(10)
                                .resultQuizId(quizId)
                                .createdBy("lecturer1")
                                .build();

                GenerateQuizFromDocumentRequest request = GenerateQuizFromDocumentRequest.builder()
                                .courseId(courseId)
                                .saveDocument(true)
                                .documentName("TCP-IP.pdf")
                                .build();

                CourseDocumentEntity tempDoc = CourseDocumentEntity.builder()
                                .id(UUID.randomUUID())
                                .fileName("TCP-IP.pdf")
                                .visibility(DocumentVisibility.TEMPORARY)
                                .status(DocumentStatus.PROCESSING)
                                .fileSize(1024L)
                                .contentHash("abc123hash")
                                .build();

                boolean promoted = promotionService.applySavePolicyAndAudit(job, request, tempDoc, true, "lecturer1",
                                "LECTURER");

                assertTrue(promoted);
                assertEquals(DocumentVisibility.GLOBAL, tempDoc.getVisibility());
                assertTrue(tempDoc.getIsPromoted());
                assertEquals(DocumentStatus.READY, tempDoc.getStatus());

                ArgumentCaptor<DocumentUploadAuditEntity> auditCaptor = ArgumentCaptor
                                .forClass(DocumentUploadAuditEntity.class);
                verify(mockAuditRepo).save(auditCaptor.capture());
                DocumentUploadAuditEntity audit = auditCaptor.getValue();

                assertTrue(audit.getIsPromoted());
                assertEquals("PROMOTED", audit.getPromotionStatus());
                assertTrue(audit.getRequestedSave());
        }

        @Test
        @DisplayName("Should NOT promote document to GLOBAL when saveRequested=true but Quiz generation FAILED")
        void testSavePolicy_NoPromotionOnQuizFailure() {
                UUID jobId = UUID.randomUUID();
                UUID courseId = UUID.randomUUID();

                QuizGenerationJobEntity job = QuizGenerationJobEntity.builder()
                                .id(jobId)
                                .courseId(courseId)
                                .acceptedCount(0)
                                .errorMessage("Document is not relevant to course context.")
                                .createdBy("lecturer1")
                                .build();

                GenerateQuizFromDocumentRequest request = GenerateQuizFromDocumentRequest.builder()
                                .courseId(courseId)
                                .saveDocument(true)
                                .documentName("Accounting.pdf")
                                .build();

                CourseDocumentEntity tempDoc = CourseDocumentEntity.builder()
                                .id(UUID.randomUUID())
                                .fileName("Accounting.pdf")
                                .visibility(DocumentVisibility.TEMPORARY)
                                .status(DocumentStatus.PROCESSING)
                                .fileSize(2048L)
                                .contentHash("hashAccounting")
                                .build();

                boolean promoted = promotionService.applySavePolicyAndAudit(job, request, tempDoc, false, "lecturer1",
                                "LECTURER");

                assertFalse(promoted);
                assertEquals(DocumentVisibility.TEMPORARY, tempDoc.getVisibility());
                assertEquals(DocumentStatus.FAILED, tempDoc.getStatus());

                ArgumentCaptor<DocumentUploadAuditEntity> auditCaptor = ArgumentCaptor
                                .forClass(DocumentUploadAuditEntity.class);
                verify(mockAuditRepo).save(auditCaptor.capture());
                DocumentUploadAuditEntity audit = auditCaptor.getValue();

                assertFalse(audit.getIsPromoted());
                assertEquals("CLEANED_UP_ON_FAILURE", audit.getPromotionStatus());
                assertNotNull(audit.getFailureReason());
        }

        @Test
        @DisplayName("Should retain document as TEMPORARY when saveRequested=false even if Quiz generation succeeds")
        void testSavePolicy_RetainTemporaryWhenSaveFalse() {
                UUID jobId = UUID.randomUUID();
                UUID courseId = UUID.randomUUID();
                UUID quizId = UUID.randomUUID();

                QuizGenerationJobEntity job = QuizGenerationJobEntity.builder()
                                .id(jobId)
                                .courseId(courseId)
                                .acceptedCount(15)
                                .resultQuizId(quizId)
                                .createdBy("lecturer1")
                                .build();

                GenerateQuizFromDocumentRequest request = GenerateQuizFromDocumentRequest.builder()
                                .courseId(courseId)
                                .saveDocument(false) // save requested = false
                                .documentName("Lecture-Slide.pdf")
                                .build();

                CourseDocumentEntity tempDoc = CourseDocumentEntity.builder()
                                .id(UUID.randomUUID())
                                .fileName("Lecture-Slide.pdf")
                                .visibility(DocumentVisibility.TEMPORARY)
                                .status(DocumentStatus.PROCESSING)
                                .fileSize(512L)
                                .contentHash("slideHash")
                                .build();

                boolean promoted = promotionService.applySavePolicyAndAudit(job, request, tempDoc, true, "lecturer1",
                                "LECTURER");

                assertFalse(promoted);
                assertEquals(DocumentVisibility.TEMPORARY, tempDoc.getVisibility());
                assertEquals(DocumentStatus.READY, tempDoc.getStatus());

                ArgumentCaptor<DocumentUploadAuditEntity> auditCaptor = ArgumentCaptor
                                .forClass(DocumentUploadAuditEntity.class);
                verify(mockAuditRepo).save(auditCaptor.capture());
                DocumentUploadAuditEntity audit = auditCaptor.getValue();

                assertFalse(audit.getIsPromoted());
                assertEquals("RETAINED_TEMPORARY", audit.getPromotionStatus());
                assertFalse(audit.getRequestedSave());
        }
}
