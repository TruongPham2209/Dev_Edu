package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.quiz.dto.request.GenerateQuizFromDocumentRequest;
import com.pht.dev_edu.quiz.entity.CourseDocumentEntity;
import com.pht.dev_edu.quiz.entity.QuizGenerationJobEntity;

/**
 * Service for enforcing document save policies and recording audit trails for document uploads.
 * Handles promoting temporary documents to the global document library and confirming uploads against garbage collection.
 */
public interface DocumentPromotionService {

    /**
     * Applies the save policy after quiz generation completes and logs the upload audit trail.
     * <p>
     * If saveDocument = true AND quiz was generated successfully (acceptedCount > 0):
     * - Promotes the temporary document to a global document (visibility = GLOBAL, isPromoted = true).
     * - Confirms the file upload record (status = COMPLETED) to prevent deletion by cron jobs.
     * <p>
     * Otherwise, if failed or saveDocument = false:
     * - Retains the document as TEMPORARY or marks it FAILED for automated TTL cleanup.
     *
     * @param job            the {@link QuizGenerationJobEntity} completed job record.
     * @param request        the original {@link GenerateQuizFromDocumentRequest} request.
     * @param documentEntity the {@link CourseDocumentEntity} database record (if any).
     * @param quizSuccess    whether the quiz generation pipeline succeeded.
     * @param username       the username of the operator.
     * @param userRole       the role of the operator (LECTURER / ADMIN).
     * @return true if the document was successfully promoted to the global library, false otherwise.
     */
    boolean applySavePolicyAndAudit(
            QuizGenerationJobEntity job,
            GenerateQuizFromDocumentRequest request,
            CourseDocumentEntity documentEntity,
            boolean quizSuccess,
            String username,
            String userRole
    );
}
