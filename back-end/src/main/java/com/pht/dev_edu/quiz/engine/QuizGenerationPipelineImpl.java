package com.pht.dev_edu.quiz.engine;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Executor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.file.dto.FileUploadResponse;
import com.pht.dev_edu.file.entity.FileUploadEntity;
import com.pht.dev_edu.file.repo.FileUploadRepository;
import com.pht.dev_edu.file.service.FileService;
import com.pht.dev_edu.quiz.dto.engine.GeneratedQuestionContract;
import com.pht.dev_edu.quiz.dto.engine.QuestionSlot;
import com.pht.dev_edu.quiz.dto.engine.QuizPlan;
import com.pht.dev_edu.quiz.dto.enums.DocumentSourceType;
import com.pht.dev_edu.quiz.dto.enums.DocumentStatus;
import com.pht.dev_edu.quiz.dto.enums.DocumentVisibility;
import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import com.pht.dev_edu.quiz.dto.enums.QuizGenerationJobStatus;
import com.pht.dev_edu.quiz.dto.enums.QuizStatus;
import com.pht.dev_edu.quiz.dto.request.GenerateQuizFromDocumentRequest;
import com.pht.dev_edu.quiz.dto.response.QuestionSourceTraceResponse;
import com.pht.dev_edu.quiz.dto.response.QuizGenerationJobResponse;
import com.pht.dev_edu.quiz.entity.CourseDocumentEntity;
import com.pht.dev_edu.quiz.entity.DocumentKnowledgeChunkEntity;
import com.pht.dev_edu.quiz.entity.QuizEntity;
import com.pht.dev_edu.quiz.entity.QuizGenerationJobEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionOptionEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionSourceTraceEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionTypeConfigEntity;
import com.pht.dev_edu.quiz.mapper.QuizMapper;
import com.pht.dev_edu.quiz.repo.CourseDocumentRepository;
import com.pht.dev_edu.quiz.repo.DocumentKnowledgeChunkRepository;
import com.pht.dev_edu.quiz.repo.QuizGenerationJobRepository;
import com.pht.dev_edu.quiz.repo.QuizQuestionOptionRepo;
import com.pht.dev_edu.quiz.repo.QuizQuestionRepo;
import com.pht.dev_edu.quiz.repo.QuizQuestionSourceTraceRepository;
import com.pht.dev_edu.quiz.repo.QuizQuestionTypeConfigRepo;
import com.pht.dev_edu.quiz.repo.QuizRepo;
import com.pht.dev_edu.quiz.service.QuizAccessService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizGenerationPipelineImpl implements QuizGenerationPipeline {
    DocumentProcessingService documentProcessingService;
    CourseRelevanceEvaluator courseRelevanceEvaluator;
    KnowledgeAvailabilityEvaluator knowledgeAvailabilityEvaluator;
    QuizRequirementValidator quizRequirementValidator;
    QuizPlannerService quizPlannerService;
    KnowledgeRetrieverService knowledgeRetrieverService;
    QuestionGeneratorService questionGeneratorService;
    QuestionValidationPipeline questionValidationPipeline;
    DocumentPromotionService documentPromotionService;
    QuizAccessService quizAccessService;
    FileService fileService;

    QuizGenerationJobRepository jobRepository;
    QuizRepo quizRepo;
    QuizQuestionRepo quizQuestionRepo;
    QuizQuestionOptionRepo quizQuestionOptionRepo;
    QuizQuestionTypeConfigRepo quizQuestionTypeConfigRepo;
    QuizQuestionSourceTraceRepository sourceTraceRepository;
    DocumentKnowledgeChunkRepository chunkRepository;
    CourseDocumentRepository courseDocumentRepository;
    FileUploadRepository fileUploadRepository;

    QuizMapper quizMapper;
    Executor taskExecutor;
    ObjectMapper objectMapper;

    private static final int MAX_SLOT_RETRIES = 3;

    @Override
    public QuizGenerationJobResponse startGenerationJob(
            GenerateQuizFromDocumentRequest request,
            InputStream fileStream,
            String username) {

        Set<String> authorities = SecurityContextUtils.getCurrentUserAuthorities();
        quizAccessService.validateAccessByQuiz(username, authorities, request.getQuizId());

        QuizEntity quiz = quizRepo.findById(request.getQuizId())
                .orElseThrow(() -> new DataNotFoundException("Quiz not found: " + request.getQuizId()));

        request.setCourseId(quiz.getCourseId());

        if (request.getDocumentId() != null && request.getSourceType() == null) {
            request.setSourceType(DocumentSourceType.LIBRARY);
        } else if (request.getDocumentObjectKey() != null && request.getSourceType() == null) {
            request.setSourceType(DocumentSourceType.UPLOAD);
        }

        if (request.getDocumentId() != null && (request.getDocumentName() == null || request.getDocumentName().isBlank())) {
            courseDocumentRepository.findByIdAndDeletedAtIsNull(request.getDocumentId())
                    .ifPresent(doc -> {
                        request.setDocumentName(doc.getFileName());
                        request.setDocumentObjectKey(doc.getFileObjectKey());
                    });
        }

        List<QuizQuestionTypeConfigEntity> typeConfigs = quizQuestionTypeConfigRepo
                .findByQuizId(request.getQuizId());
        if (typeConfigs == null || typeConfigs.isEmpty()) {
            throw new BadRequestException(
                    "Quiz " + request.getQuizId() + " has no question type configurations defined.");
        }

        Map<QuestionType, Integer> remainingTypeDistribution = new HashMap<>();
        int totalRemaining = 0;
        for (QuizQuestionTypeConfigEntity cfg : typeConfigs) {
            int existingCount = quizQuestionRepo.countByQuizIdAndQuestionTypeAndDeletedAtIsNull(request.getQuizId(),
                    cfg.getQuestionType());
            int remaining = Math.max(0, cfg.getRequiredCount() - existingCount);
            if (remaining > 0) {
                remainingTypeDistribution.put(cfg.getQuestionType(), remaining);
                totalRemaining += remaining;
            }
        }

        if (totalRemaining <= 0) {
            throw new BadRequestException(
                    "Quiz " + request.getQuizId() + " has no remaining question slots available for generation.");
        }

        request.setTotalQuestions(totalRemaining);
        request.setTypeDistribution(remainingTypeDistribution);

        QuizRequirementValidator.ValidatedRequirements reqs = quizRequirementValidator.validateAndNormalize(request);

        String configJson = serializeJson(reqs);
        QuizGenerationJobEntity jobEntity = QuizGenerationJobEntity.builder()
                .courseId(request.getCourseId())
                .documentId(request.getDocumentId())
                .documentObjectKey(request.getDocumentObjectKey())
                .documentName(request.getDocumentName() != null ? request.getDocumentName() : "Document")
                .status(QuizGenerationJobStatus.PENDING)
                .currentStep("PENDING")
                .requestedTotal(reqs.getTotalQuestions())
                .requestedConfig(configJson)
                .createdBy(username)
                .build();

        QuizGenerationJobEntity savedJob = jobRepository.saveAndFlush(jobEntity);
        log.info("Created QuizGenerationJob {} for course {} (sourceType={})",
                savedJob.getId(), request.getCourseId(), request.getSourceType());

        byte[] streamBytes = null;
        if (fileStream != null) {
            try {
                streamBytes = fileStream.readAllBytes();
            } catch (Exception e) {
                log.error("Failed to read document input stream", e);
            }
        }
        final byte[] finalStreamBytes = streamBytes;

        taskExecutor.execute(() -> executePipelineAsync(savedJob.getId(), request, finalStreamBytes, username));

        return mapToResponse(savedJob);
    }

    @Override
    public QuizGenerationJobResponse startGenerationJobFromFile(
            UUID quizId,
            String description,
            Boolean saveDocument,
            MultipartFile file,
            String username) {

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty.");
        }

        FileUploadResponse fileResp = fileService.uploadDirectFile(file, false, username);

        try (InputStream is = file.getInputStream()) {
            GenerateQuizFromDocumentRequest request = GenerateQuizFromDocumentRequest.builder()
                    .quizId(quizId)
                    .description(description)
                    .sourceType(DocumentSourceType.UPLOAD)
                    .documentName(fileResp.getOriginalFileName())
                    .documentObjectKey(fileResp.getObjectKey())
                    .saveDocument(saveDocument)
                    .build();

            return startGenerationJob(request, is, username);
        } catch (Exception e) {
            log.error("Failed to read uploaded file for quiz {}: ", quizId, e);
            throw new BadRequestException("Failed to read uploaded file: " + e.getMessage());
        }
    }

    @Override
    public QuizGenerationJobResponse getJobStatus(UUID jobId, String username) {
        QuizGenerationJobEntity job = jobRepository.findById(jobId)
                .orElseThrow(() -> new DataNotFoundException("Quiz generation job not found: " + jobId));

        return mapToResponse(job);
    }

    @Override
    public QuestionSourceTraceResponse getQuestionSourceTraceability(UUID jobId, UUID questionId) {
        QuizQuestionSourceTraceEntity trace = sourceTraceRepository.findByQuestionId(questionId)
                .orElseThrow(() -> new DataNotFoundException(
                        "Source traceability record not found for question: " + questionId));

        return quizMapper.toResponse(trace);
    }

    private void executePipelineAsync(UUID jobId, GenerateQuizFromDocumentRequest request, byte[] fileBytes,
            String username) {
        long startTime = System.currentTimeMillis();
        QuizGenerationJobEntity job = null;
        for (int i = 0; i < 5; i++) {
            job = jobRepository.findById(jobId).orElse(null);
            if (job != null)
                break;
            try {
                Thread.sleep(100);
            } catch (InterruptedException ignored) {
            }
        }
        if (job == null) {
            log.error("Fatal: QuizGenerationJob {} not found in database for async execution", jobId);
            return;
        }

        CourseDocumentEntity tempDocEntity = null;

        try {
            updateJobStep(job, QuizGenerationJobStatus.PROCESSING, "DOCUMENT_PROCESSING");

            List<DocumentKnowledgeChunkEntity> chunks = null;

            // Option Existing Global Document from Library
            if ((request.getSourceType() == DocumentSourceType.LIBRARY || request.getDocumentId() != null)
                    && request.getDocumentId() != null) {
                log.info("Job {}: Using existing Global Document {}", jobId, request.getDocumentId());
                CourseDocumentEntity globalDoc = courseDocumentRepository
                        .findByIdAndDeletedAtIsNull(request.getDocumentId())
                        .orElseThrow(() -> new DataNotFoundException(
                                "Global document not found: " + request.getDocumentId()));

                tempDocEntity = globalDoc;
                job.setDocumentName(globalDoc.getFileName());
                job.setDocumentObjectKey(globalDoc.getFileObjectKey());
                jobRepository.save(job);

                chunks = chunkRepository.findByDocumentId(request.getDocumentId());

                if (chunks == null || chunks.isEmpty()) {
                    log.info("Job {}: Global document {} has no pre-computed chunks. Syncing embeddings from storage...",
                            jobId, globalDoc.getId());
                    if (globalDoc.getFileObjectKey() != null) {
                        try {
                            byte[] downloadedBytes = fileService.downloadFileBytes(globalDoc.getFileObjectKey());
                            try (InputStream is = new java.io.ByteArrayInputStream(downloadedBytes)) {
                                chunks = documentProcessingService.processAndStoreDocument(globalDoc, is);
                            }
                            globalDoc.setStatus(DocumentStatus.READY);
                            courseDocumentRepository.save(globalDoc);
                            log.info("Job {}: Successfully synced {} chunks with embeddings for document {}",
                                    jobId, chunks.size(), globalDoc.getId());
                        } catch (Exception syncEx) {
                            log.error("Job {}: Failed to sync embeddings from storage for document {}: {}",
                                    jobId, globalDoc.getId(), syncEx.getMessage());
                        }
                    }
                }
            }

            // Option New PDF Upload
            if (chunks == null || chunks.isEmpty()) {
                if (fileBytes != null && fileBytes.length > 0) {
                    String docName = request.getDocumentName() != null ? request.getDocumentName()
                            : "Uploaded-Document.pdf";
                    String objKey = request.getDocumentObjectKey();

                    if (objKey == null || objKey.isBlank()) {
                        log.warn("Job {}: documentObjectKey is missing from request. Generating fallback key.", jobId);
                        objKey = "documents/" + jobId + "/" + docName;
                    }

                    Long fileSize = (long) fileBytes.length;
                    Optional<FileUploadEntity> fileUploadOpt = fileUploadRepository.findByObjectKey(objKey);
                    if (fileUploadOpt.isPresent()) {
                        FileUploadEntity fileUpload = fileUploadOpt.get();
                        if (fileUpload.getFileName() != null && !fileUpload.getFileName().isBlank()) {
                            docName = fileUpload.getFileName();
                        }
                        if (fileUpload.getFileSize() != null && fileUpload.getFileSize() > 0) {
                            fileSize = fileUpload.getFileSize();
                        }
                    }

                    String contentHash = computeSha256(fileBytes);

                    tempDocEntity = CourseDocumentEntity.builder()
                            .title(request.getTitle() != null ? request.getTitle() : docName)
                            .fileName(docName)
                            .fileObjectKey(objKey)
                            .fileSize(fileSize)
                            .contentHash(contentHash)
                            .status(DocumentStatus.PROCESSING)
                            .visibility(DocumentVisibility.TEMPORARY)
                            .isPromoted(false)
                            .createdBy(username)
                            .build();

                    tempDocEntity = courseDocumentRepository.save(tempDocEntity);
                    job.setDocumentId(tempDocEntity.getId());
                    job.setDocumentObjectKey(objKey);
                    job.setDocumentName(docName);
                    jobRepository.save(job);

                    try (InputStream is = new java.io.ByteArrayInputStream(fileBytes)) {
                        chunks = documentProcessingService.processAndStoreDocument(tempDocEntity, is);
                    }
                } else if (StringUtils.hasText(request.getTopic())) {
                    String topicDocName = request.getDocumentName() != null ? request.getDocumentName()
                            : "Course Content";
                    String topicHash = computeSha256(
                            request.getTopic().getBytes(java.nio.charset.StandardCharsets.UTF_8));

                    tempDocEntity = CourseDocumentEntity.builder()
                            .title(topicDocName)
                            .fileName(topicDocName)
                            .fileObjectKey("topic/" + jobId)
                            .contentHash(topicHash)
                            .status(DocumentStatus.PROCESSING)
                            .visibility(DocumentVisibility.TEMPORARY)
                            .isPromoted(false)
                            .createdBy(username)
                            .build();

                    tempDocEntity = courseDocumentRepository.save(tempDocEntity);
                    job.setDocumentId(tempDocEntity.getId());
                    jobRepository.save(job);

                    chunks = documentProcessingService.processAndStoreText(tempDocEntity, request.getTopic());
                }
            }

            if (chunks == null || chunks.isEmpty()) {
                failJob(job, QuizGenerationJobStatus.FAILED, "No usable document knowledge units available.");
                documentPromotionService.applySavePolicyAndAudit(job, request, tempDocEntity, false, username,
                        "LECTURER");
                return;
            }

            // Step 2: Course Relevance Evaluation
            updateJobStep(job, QuizGenerationJobStatus.PROCESSING, "RELEVANCE_CHECKING");
            CourseRelevanceEvaluator.EvaluationOutcome relevanceOutcome = courseRelevanceEvaluator
                    .evaluateRelevance(request.getCourseId(), chunks);

            if (relevanceOutcome.getStatus() == CourseRelevanceEvaluator.RelevanceStatus.NOT_RELEVANT) {
                failJob(job, QuizGenerationJobStatus.IRRELEVANT_DOCUMENT, relevanceOutcome.getReason());
                documentPromotionService.applySavePolicyAndAudit(job, request, tempDocEntity, false, username,
                        "LECTURER");
                return;
            }

            List<DocumentKnowledgeChunkEntity> eligibleChunks = relevanceOutcome.getEligibleChunks();

            // Step 3: Knowledge Availability Evaluation
            updateJobStep(job, QuizGenerationJobStatus.PROCESSING, "KNOWLEDGE_EVALUATING");
            QuizRequirementValidator.ValidatedRequirements reqs = quizRequirementValidator
                    .validateAndNormalize(request);
            KnowledgeAvailabilityEvaluator.CapacityOutcome capacityOutcome = knowledgeAvailabilityEvaluator
                    .evaluateCapacity(eligibleChunks, reqs.getTotalQuestions());

            if (capacityOutcome.getStatus() == KnowledgeAvailabilityEvaluator.CapacityStatus.ZERO_KNOWLEDGE) {
                failJob(job, QuizGenerationJobStatus.INSUFFICIENT_SOURCE, capacityOutcome.getReason());
                documentPromotionService.applySavePolicyAndAudit(job, request, tempDocEntity, false, username,
                        "LECTURER");
                return;
            }

            job.setUsableCapacity(capacityOutcome.getUsableCapacity());
            jobRepository.save(job);

            // Step 4 & 5: Quiz Planning
            updateJobStep(job, QuizGenerationJobStatus.PROCESSING, "PLANNING");
            QuizPlan plan = quizPlannerService.createPlan(
                    request.getCourseId(),
                    request.getDocumentId(),
                    reqs,
                    capacityOutcome.getUsableCapacity(),
                    eligibleChunks,
                    request.getTopic());

            // Step 6: Question Generation & Validation Loop
            updateJobStep(job, QuizGenerationJobStatus.PROCESSING, "GENERATING");
            List<GeneratedQuestionContract> acceptedQuestions = new ArrayList<>();
            Map<String, Integer> rejectionReasonCounts = new HashMap<>();

            int processedCount = 0;
            int acceptedCount = 0;
            int rejectedCount = 0;

            for (QuestionSlot slot : plan.getSlots()) {
                processedCount++;
                job.setProcessedCount(processedCount);

                String retryFeedback = null;

                for (int attempt = 1; attempt <= MAX_SLOT_RETRIES; attempt++) {
                    slot.setAttemptCount(attempt);
                    KnowledgeRetrieverService.RetrievedContext context = knowledgeRetrieverService
                            .retrieveContextForSlot(slot, eligibleChunks);

                    try {
                        GeneratedQuestionContract candidate = questionGeneratorService.generateQuestion(slot, context,
                                retryFeedback);
                        QuestionValidationPipeline.ValidationResult valResult = questionValidationPipeline
                                .validateQuestion(
                                        candidate,
                                        context.getContextText(),
                                        acceptedQuestions,
                                        request.getCourseId());

                        if (valResult.isPassed()) {
                            slot.setAccepted(true);
                            acceptedQuestions.add(candidate);
                            acceptedCount++;
                            log.info("Accepted question for slot {} on attempt {}", slot.getSlotIndex(), attempt);
                            break;
                        } else {
                            rejectedCount++;
                            String reasonKey = valResult.getFailureReason() != null
                                    ? valResult.getFailureReason().name()
                                    : "VALIDATION_FAILED";
                            rejectionReasonCounts.put(reasonKey, rejectionReasonCounts.getOrDefault(reasonKey, 0) + 1);
                            retryFeedback = valResult.getMessage();
                            log.warn("Slot {} attempt {} failed validation: {}", slot.getSlotIndex(), attempt,
                                    valResult.getMessage());
                        }
                    } catch (Exception e) {
                        rejectedCount++;
                        rejectionReasonCounts.put("GENERATION_EXCEPTION",
                                rejectionReasonCounts.getOrDefault("GENERATION_EXCEPTION", 0) + 1);
                        retryFeedback = e.getMessage();
                        log.error("Slot {} attempt {} exception: {}", slot.getSlotIndex(), attempt, e.getMessage());
                    }
                }

                job.setAcceptedCount(acceptedCount);
                job.setRejectedCount(rejectedCount);
                job.setRejectionReasons(serializeJson(rejectionReasonCounts));
                jobRepository.save(job);
            }

            // Step 7: Final Quiz Validation & Persistence
            updateJobStep(job, QuizGenerationJobStatus.PROCESSING, "VALIDATING");
            if (acceptedQuestions.isEmpty()) {
                failJob(job, QuizGenerationJobStatus.FAILED,
                        "Generation pipeline completed but no questions passed validation checks.");
                documentPromotionService.applySavePolicyAndAudit(job, request, tempDocEntity, false, username,
                        "LECTURER");
                return;
            }

            UUID createdQuizId = persistQuizAndQuestions(job, request, acceptedQuestions);

            // Invalidate Redis cache for quiz & quiz detail
            invalidateQuizCached(createdQuizId);

            long duration = System.currentTimeMillis() - startTime;
            job.setExecutionTimeMs(duration);
            job.setResultQuizId(createdQuizId);
            job.setCurrentStep("FINISHED");

            boolean isFullSuccess = acceptedCount >= reqs.getTotalQuestions();
            if (isFullSuccess) {
                job.setStatus(QuizGenerationJobStatus.COMPLETED);
                job.setErrorMessage(null);
            } else {
                job.setStatus(QuizGenerationJobStatus.PARTIAL);
                job.setErrorMessage("Generated " + acceptedCount + " high-quality questions out of "
                        + reqs.getTotalQuestions() + " requested due to source capacity constraints.");
            }

            jobRepository.save(job);

            // Apply Option 3 Save Policy & Audit Log
            documentPromotionService.applySavePolicyAndAudit(job, request, tempDocEntity, true, username, "LECTURER");

            log.info("Quiz Generation Job {} completed with status {} in {} ms (quizId={})",
                    job.getId(), job.getStatus(), duration, createdQuizId);

        } catch (Exception e) {
            log.error("Fatal exception in quiz generation pipeline execution for job {}", jobId, e);
            failJob(job, QuizGenerationJobStatus.FAILED, "Pipeline execution error: " + e.getMessage());
            documentPromotionService.applySavePolicyAndAudit(job, request, tempDocEntity, false, username, "LECTURER");
        }
    }

    @Transactional
    protected UUID persistQuizAndQuestions(
            QuizGenerationJobEntity job,
            GenerateQuizFromDocumentRequest request,
            List<GeneratedQuestionContract> acceptedQuestions) {

        QuizEntity savedQuiz;
        if (request.getQuizId() != null) {
            savedQuiz = quizRepo.findById(request.getQuizId())
                    .orElseThrow(() -> new DataNotFoundException("Quiz not found: " + request.getQuizId()));
        } else {
            String title = request.getTitle() != null && !request.getTitle().isBlank()
                    ? request.getTitle()
                    : "AI Generated Quiz - "
                            + (request.getDocumentName() != null ? request.getDocumentName() : "Course Document");

            QuizEntity quiz = QuizEntity.builder()
                    .courseId(request.getCourseId())
                    .title(title)
                    .description("Auto-generated from document '" + job.getDocumentName() + "' ("
                            + acceptedQuestions.size() + " questions)")
                    .status(QuizStatus.DRAFT)
                    .createdBy(job.getCreatedBy())
                    .build();

            savedQuiz = quizRepo.save(quiz);
        }

        int existingQuestionCount = quizQuestionRepo.countByQuizIdAndDeletedAtIsNull(savedQuiz.getId());
        int orderIdx = existingQuestionCount + 1;

        for (GeneratedQuestionContract qContract : acceptedQuestions) {
            BigDecimal points = qContract.getPoints() != null ? qContract.getPoints() : BigDecimal.valueOf(1.0);
            Optional<QuizQuestionTypeConfigEntity> existingConfigOpt = quizQuestionTypeConfigRepo
                    .findByQuizIdAndQuestionType(savedQuiz.getId(), qContract.getQuestionType());
            if (existingConfigOpt.isPresent() && existingConfigOpt.get().getPointsPerQuestion() != null) {
                points = existingConfigOpt.get().getPointsPerQuestion();
            }

            QuizQuestionEntity questionEntity = QuizQuestionEntity.builder()
                    .quizId(savedQuiz.getId())
                    .questionType(qContract.getQuestionType())
                    .content(qContract.getContent())
                    .points(points)
                    .orderIndex(orderIdx++)
                    .build();

            QuizQuestionEntity savedQuestion = quizQuestionRepo.save(questionEntity);

            if (qContract.getOptions() != null && !qContract.getOptions().isEmpty()) {
                int optIdx = 1;
                for (GeneratedQuestionContract.OptionContract opt : qContract.getOptions()) {
                    QuizQuestionOptionEntity optEntity = QuizQuestionOptionEntity.builder()
                            .questionId(savedQuestion.getId())
                            .optionText(opt.getOptionText())
                            .isCorrect(Boolean.TRUE.equals(opt.getIsCorrect()))
                            .orderIndex(optIdx++)
                            .build();

                    quizQuestionOptionRepo.save(optEntity);
                }
            }

            QuizQuestionSourceTraceEntity traceEntity = QuizQuestionSourceTraceEntity.builder()
                    .questionId(savedQuestion.getId())
                    .generationJobId(job.getId())
                    .documentId(job.getDocumentId())
                    .chunkId(qContract.getSourceChunkId())
                    .sectionName(qContract.getSourceSection())
                    .pageNumber(qContract.getSourcePage())
                    .modelName("gpt-4o-mini")
                    .promptVersion("v1.0")
                    .attemptCount(1)
                    .validationMetrics(serializeJson(Map.of("explanation",
                            qContract.getExplanation() != null ? qContract.getExplanation() : "")))
                    .build();

            sourceTraceRepository.save(traceEntity);
        }

        return savedQuiz.getId();
    }

    private void updateJobStep(QuizGenerationJobEntity job, QuizGenerationJobStatus status, String step) {
        job.setStatus(status);
        job.setCurrentStep(step);
        jobRepository.save(job);
    }

    private void failJob(QuizGenerationJobEntity job, QuizGenerationJobStatus status, String errorMessage) {
        job.setStatus(status);
        job.setCurrentStep("FAILED");
        job.setErrorMessage(errorMessage);
        jobRepository.save(job);
        log.warn("Job {} failed with status {}: {}", job.getId(), status, errorMessage);
    }

    private QuizGenerationJobResponse mapToResponse(QuizGenerationJobEntity job) {
        Map<String, Integer> rejectionReasonsMap = null;
        if (job.getRejectionReasons() != null && !job.getRejectionReasons().isBlank()) {
            try {
                rejectionReasonsMap = objectMapper.readValue(job.getRejectionReasons(), new TypeReference<Map<String, Integer>>() {});
            } catch (Exception ignored) {
            }
        }

        return quizMapper.toResponse(job, rejectionReasonsMap);
    }

    private String serializeJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }

    private String computeSha256(byte[] bytes) {
        if (bytes == null || bytes.length == 0)
            return "N/A";
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(bytes);
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1)
                    hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return String.valueOf(Arrays.hashCode(bytes));
        }
    }

    private void invalidateQuizCached(UUID quizId) {
        if (quizId != null) {
            RedisUtils.invalidateCache(RedisPrefixConstant.QUIZ_PREFIX + quizId);
            RedisUtils.invalidateCache(RedisPrefixConstant.QUIZ_DETAIL_PREFIX + quizId);
        }
    }
}
