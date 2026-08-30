package com.pht.dev_edu.quiz.mapper;

import com.pht.dev_edu.quiz.dto.event.QuizAuditLogEvent;
import com.pht.dev_edu.quiz.dto.event.QuizAutosaveLogEvent;
import com.pht.dev_edu.quiz.dto.projection.QuizEssaySubmissionProjection;
import com.pht.dev_edu.quiz.dto.request.*;
import com.pht.dev_edu.quiz.dto.response.*;
import com.pht.dev_edu.quiz.entity.*;
import org.mapstruct.IterableMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * MapStruct mapper for quiz entities, requests, responses, projections, and attempt models.
 */
@Mapper(componentModel = "spring")
@Named("quizMapper")
public interface QuizMapper {

    // Quiz
    QuizResponse toResponse(QuizEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "DRAFT")
    @Mapping(target = "submittedBy", ignore = true)
    @Mapping(target = "submittedAt", ignore = true)
    @Mapping(target = "approvedBy", ignore = true)
    @Mapping(target = "approvedAt", ignore = true)
    @Mapping(target = "rejectedBy", ignore = true)
    @Mapping(target = "rejectedAt", ignore = true)
    @Mapping(target = "reviewedBy", ignore = true)
    @Mapping(target = "reviewedAt", ignore = true)
    @Mapping(target = "rejectionReason", ignore = true)
    @Mapping(target = "createdBy", source = "createdBy")
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    QuizEntity toEntity(QuizRequest request, String createdBy);

    // Type Config
    QuizTypeConfigResponse toResponse(QuizQuestionTypeConfigEntity entity);

    List<QuizTypeConfigResponse> toTypeConfigResponseList(List<QuizQuestionTypeConfigEntity> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "quizId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    QuizQuestionTypeConfigEntity toEntity(QuizTypeConfigRequest request);

    // Question & Option
    @Mapping(target = "options", ignore = true)
    QuizQuestionResponse toResponse(QuizQuestionEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "quizId", ignore = true)
    @Mapping(target = "points", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    QuizQuestionEntity toEntity(QuizQuestionRequest request);

    @Named("toOptionResponse")
    QuizQuestionOptionResponse toResponse(QuizQuestionOptionEntity entity);

    @IterableMapping(qualifiedByName = "toOptionResponse")
    List<QuizQuestionOptionResponse> toOptionResponseList(List<QuizQuestionOptionEntity> entities);

    @Named("toMaskedOptionResponse")
    @Mapping(target = "isCorrect", ignore = true)
    QuizQuestionOptionResponse toMaskedOptionResponse(QuizQuestionOptionEntity entity);

    @IterableMapping(qualifiedByName = "toMaskedOptionResponse")
    List<QuizQuestionOptionResponse> toMaskedOptionResponseList(List<QuizQuestionOptionEntity> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "questionId", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    QuizQuestionOptionEntity toEntity(QuizQuestionOptionRequest request);

    // Assignment
    QuizAssignmentResponse toResponse(QuizAssignmentEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdBy", source = "createdBy")
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    QuizAssignmentEntity toEntity(CreateAssignmentRequest request, String createdBy);

    // Course Document
    CourseDocumentResponse toResponse(CourseDocumentEntity entity);

    List<CourseDocumentResponse> toCourseDocumentResponseList(List<CourseDocumentEntity> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "READY")
    @Mapping(target = "visibility", constant = "GLOBAL")
    @Mapping(target = "isPromoted", constant = "false")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    CourseDocumentEntity toGlobalDocumentEntity(String title, String fileName, String fileObjectKey, Long fileSize,
            String contentHash, String createdBy);

    // Attempt & Submission
    @Mapping(target = "attemptId", source = "id")
    SubmitAttemptResponse toSubmitResponse(QuizAttemptEntity entity);

    List<SubmitAttemptResponse> toSubmitResponseList(List<QuizAttemptEntity> entities);

    QuizEssaySubmissionResponse toResponse(QuizEssaySubmissionProjection projection);

    @Mapping(target = "selectedOptionIds", ignore = true)
    QuizAttemptAnswerEntityDto toAnswerDto(QuizAttemptAnswerEntity entity);

    List<QuizAttemptAnswerEntityDto> toAnswerDtoList(List<QuizAttemptAnswerEntity> entities);

    @Mapping(target = "attemptId", source = "entity.id")
    @Mapping(target = "answers", source = "answers")
    AttemptResultResponse toResultResponse(QuizAttemptEntity entity, List<AttemptAnswerResultDto> answers);

    @Mapping(target = "attemptId", source = "entity.id")
    @Mapping(target = "answers", source = "answers")
    QuizAttemptReviewResponse toReviewResponse(QuizAttemptEntity entity, List<AttemptAnswerResultDto> answers);

    @Mapping(target = "attemptId", source = "entity.id")
    @Mapping(target = "activeSessionToken", expression = "java(entity.getStatus() == com.pht.dev_edu.quiz.dto.enums.AttemptStatus.IN_PROGRESS ? entity.getActiveSessionToken() : null)")
    @Mapping(target = "questions", source = "questions")
    @Mapping(target = "existingAnswers", source = "existingAnswers")
    StartAttemptResponse toStartResponse(QuizAttemptEntity entity, List<QuizQuestionResponse> questions,
            List<QuizAttemptAnswerEntityDto> existingAnswers);

    // AI Generation Pipeline & Audit
    QuestionSourceTraceResponse toResponse(QuizQuestionSourceTraceEntity entity);

    @Mapping(target = "jobId", source = "entity.id")
    @Mapping(target = "courseId", source = "entity.courseId")
    @Mapping(target = "documentId", source = "entity.documentId")
    @Mapping(target = "documentName", source = "entity.documentName")
    @Mapping(target = "status", source = "entity.status")
    @Mapping(target = "currentStep", source = "entity.currentStep")
    @Mapping(target = "requestedTotal", source = "entity.requestedTotal")
    @Mapping(target = "usableCapacity", source = "entity.usableCapacity")
    @Mapping(target = "processedCount", source = "entity.processedCount")
    @Mapping(target = "acceptedCount", source = "entity.acceptedCount")
    @Mapping(target = "rejectedCount", source = "entity.rejectedCount")
    @Mapping(target = "resultQuizId", source = "entity.resultQuizId")
    @Mapping(target = "errorMessage", source = "entity.errorMessage")
    @Mapping(target = "tokenUsage", source = "entity.tokenUsage")
    @Mapping(target = "executionTimeMs", source = "entity.executionTimeMs")
    @Mapping(target = "createdBy", source = "entity.createdBy")
    @Mapping(target = "createdAt", source = "entity.createdAt")
    @Mapping(target = "updatedAt", source = "entity.updatedAt")
    @Mapping(target = "rejectionReasons", source = "rejectionReasonsMap")
    QuizGenerationJobResponse toResponse(QuizGenerationJobEntity entity, Map<String, Integer> rejectionReasonsMap);

    DocumentUploadAuditResponse toResponse(DocumentUploadAuditEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uploadedBy", expression = "java(username != null ? username : job.getCreatedBy())")
    @Mapping(target = "userRole", expression = "java(userRole != null ? userRole : \"LECTURER\")")
    @Mapping(target = "fileName", expression = "java(request.getDocumentName() != null ? request.getDocumentName() : job.getDocumentName())")
    @Mapping(target = "fileSize", expression = "java(documentEntity != null && documentEntity.getFileSize() != null ? documentEntity.getFileSize() : 0L)")
    @Mapping(target = "contentHash", expression = "java(documentEntity != null && documentEntity.getContentHash() != null ? documentEntity.getContentHash() : \"N/A\")")
    @Mapping(target = "quizId", source = "job.resultQuizId")
    @Mapping(target = "courseId", source = "job.courseId")
    @Mapping(target = "generationJobId", source = "job.id")
    @Mapping(target = "requestedSave", source = "requestedSave")
    @Mapping(target = "isPromoted", source = "shouldPromote")
    @Mapping(target = "promotionStatus", source = "promotionStatus")
    @Mapping(target = "failureReason", source = "failureReason")
    @Mapping(target = "createdAt", ignore = true)
    DocumentUploadAuditEntity toAuditEntity(
            GenerateQuizFromDocumentRequest request,
            QuizGenerationJobEntity job,
            CourseDocumentEntity documentEntity,
            boolean requestedSave,
            boolean shouldPromote,
            String promotionStatus,
            String failureReason,
            String username,
            String userRole);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "oldValue", source = "oldValueStr")
    @Mapping(target = "newValue", source = "newValueStr")
    QuizAuditLogEntity toAuditLogEntity(QuizAuditLogEvent event, String oldValueStr, String newValueStr);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "selectedOptionIds", source = "selectedOptionIdsJson")
    QuizAttemptAnswerLogEntity toAnswerLogEntity(QuizAutosaveLogEvent event, String selectedOptionIdsJson);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "attemptAnswerId", source = "answer.id")
    @Mapping(target = "questionId", source = "questionId")
    @Mapping(target = "attemptId", source = "attemptId")
    @Mapping(target = "graderUsername", source = "graderUsername")
    @Mapping(target = "awardedPoints", source = "request.awardedPoints")
    @Mapping(target = "feedback", source = "request.feedback")
    @Mapping(target = "gradedAt", source = "now")
    @Mapping(target = "createdAt", ignore = true)
    QuizEssayGradingEntity toEssayGradingEntity(
            QuizAttemptAnswerEntity answer,
            UUID attemptId,
            UUID questionId,
            GradeEssayRequest request,
            String graderUsername,
            LocalDateTime now);
}
