package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.file.dto.UploadStatus;
import com.pht.dev_edu.file.entity.FileUploadEntity;
import com.pht.dev_edu.file.repo.FileUploadRepository;
import com.pht.dev_edu.quiz.dto.enums.DocumentStatus;
import com.pht.dev_edu.quiz.dto.enums.DocumentVisibility;
import com.pht.dev_edu.quiz.dto.request.GenerateQuizFromDocumentRequest;
import com.pht.dev_edu.quiz.entity.CourseDocumentEntity;
import com.pht.dev_edu.quiz.entity.DocumentUploadAuditEntity;
import com.pht.dev_edu.quiz.entity.QuizGenerationJobEntity;
import com.pht.dev_edu.quiz.repo.CourseDocumentRepository;
import com.pht.dev_edu.quiz.repo.DocumentUploadAuditRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DocumentPromotionServiceImpl implements DocumentPromotionService {
    CourseDocumentRepository documentRepository;
    DocumentUploadAuditRepository auditRepository;
    FileUploadRepository fileUploadRepository;

    @Override
    @Transactional
    public boolean applySavePolicyAndAudit(
            QuizGenerationJobEntity job,
            GenerateQuizFromDocumentRequest request,
            CourseDocumentEntity documentEntity,
            boolean quizSuccess,
            String username,
            String userRole) {

        boolean requestedSave = Boolean.TRUE.equals(request.getSaveDocument());
        boolean shouldPromote = requestedSave && quizSuccess && (job.getAcceptedCount() != null && job.getAcceptedCount() > 0);

        String promotionStatus;
        String failureReason = null;

        if (shouldPromote) {
            promotionStatus = "PROMOTED";
            if (documentEntity != null) {
                documentEntity.setVisibility(DocumentVisibility.GLOBAL);
                documentEntity.setIsPromoted(true);
                documentEntity.setStatus(DocumentStatus.READY);
                documentRepository.save(documentEntity);

                // Confirm file upload in file_upload table to prevent cronjob purge
                confirmFileUploadInStorage(documentEntity.getFileObjectKey());

                log.info("Successfully promoted document {} to Global Document Library after Quiz generation success (jobId={})",
                        documentEntity.getId(), job.getId());
            }
        } else if (quizSuccess) {
            promotionStatus = "RETAINED_TEMPORARY";
            if (documentEntity != null) {
                documentEntity.setVisibility(DocumentVisibility.TEMPORARY);
                documentEntity.setStatus(DocumentStatus.READY);
                documentRepository.save(documentEntity);
            }
            log.info("Document {} retained as Temporary after Quiz generation success (saveRequested=false, jobId={})",
                    documentEntity != null ? documentEntity.getId() : null, job.getId());
        } else {
            promotionStatus = "CLEANED_UP_ON_FAILURE";
            failureReason = job.getErrorMessage() != null ? job.getErrorMessage() : "Quiz generation failed or produced 0 accepted questions.";
            if (documentEntity != null) {
                documentEntity.setStatus(DocumentStatus.FAILED);
                documentRepository.save(documentEntity);
            }
            log.warn("Document {} NOT promoted to Global Library because Quiz generation failed (jobId={}, reason={})",
                    documentEntity != null ? documentEntity.getId() : null, job.getId(), failureReason);
        }

        // Save Audit Record
        DocumentUploadAuditEntity audit = DocumentUploadAuditEntity.builder()
                .uploadedBy(username != null ? username : job.getCreatedBy())
                .userRole(userRole != null ? userRole : "LECTURER")
                .fileName(request.getDocumentName() != null ? request.getDocumentName() : job.getDocumentName())
                .fileSize(documentEntity != null ? documentEntity.getFileSize() : 0L)
                .contentHash(documentEntity != null ? documentEntity.getContentHash() : "N/A")
                .quizId(job.getResultQuizId())
                .courseId(job.getCourseId())
                .generationJobId(job.getId())
                .requestedSave(requestedSave)
                .isPromoted(shouldPromote)
                .promotionStatus(promotionStatus)
                .failureReason(failureReason)
                .build();

        auditRepository.save(audit);
        return shouldPromote;
    }

    private void confirmFileUploadInStorage(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) return;
        try {
            Optional<FileUploadEntity> fileOpt = fileUploadRepository.findByObjectKey(objectKey);
            if (fileOpt.isPresent()) {
                FileUploadEntity fileUpload = fileOpt.get();
                fileUpload.setStatus(UploadStatus.COMPLETED);
                fileUpload.setConfirmedAt(LocalDateTime.now());
                fileUploadRepository.save(fileUpload);
                log.info("Confirmed file_upload record for objectKey={} to prevent cronjob purge", objectKey);
            }
        } catch (Exception e) {
            log.warn("Failed to confirm file_upload for objectKey={}: {}", objectKey, e.getMessage());
        }
    }
}
