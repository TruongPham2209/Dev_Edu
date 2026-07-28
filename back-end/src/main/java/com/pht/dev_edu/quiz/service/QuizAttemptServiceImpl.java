package com.pht.dev_edu.quiz.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.exception.security.AccessDeniedException;
import com.pht.dev_edu.enrollment.repo.EnrollmentRepository;
import com.pht.dev_edu.quiz.dto.enums.AssignmentStatus;
import com.pht.dev_edu.quiz.dto.enums.AttemptStatus;
import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import com.pht.dev_edu.quiz.dto.enums.QuizAuditAction;
import com.pht.dev_edu.quiz.dto.event.QuizAutosaveLogEvent;
import com.pht.dev_edu.quiz.dto.request.AutosaveRequest;
import com.pht.dev_edu.quiz.dto.request.HeartbeatRequest;
import com.pht.dev_edu.quiz.dto.response.*;
import com.pht.dev_edu.quiz.entity.*;
import com.pht.dev_edu.quiz.mapper.QuizMapper;
import com.pht.dev_edu.quiz.repo.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizAttemptServiceImpl implements QuizAttemptService {
    QuizAttemptRepo attemptRepo;
    QuizAssignmentRepo assignmentRepo;
    QuizRepo quizRepo;
    QuizQuestionRepo questionRepo;
    QuizQuestionOptionRepo optionRepo;
    QuizAttemptAnswerRepo answerRepo;
    QuizAttemptAnswerLogRepo answerLogRepo;
    EnrollmentRepository enrollmentRepository;
    QuizMapper quizMapper;
    QuizAuditService auditService;
    ObjectMapper objectMapper;
    KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public StartAttemptResponse startAttempt(UUID assignmentId, String username, String sessionToken) {
        QuizAssignmentEntity assignment = assignmentRepo.findByIdAndDeletedAtIsNull(assignmentId)
                .orElseThrow(() -> new DataNotFoundException("Assignment not found with ID: " + assignmentId));

        QuizEntity quiz = quizRepo.findByIdAndDeletedAtIsNull(assignment.getQuizId())
                .orElseThrow(() -> new DataNotFoundException("Quiz not found with ID: " + assignment.getQuizId()));

        // Step 1: Check enrollment
        boolean isEnrolled = enrollmentRepository.existsByStudentUsernameAndCourseId(username, quiz.getCourseId());
        if (!isEnrolled) {
            throw new AccessDeniedException("Student is not enrolled in course ID: " + quiz.getCourseId());
        }

        // Step 2: Check assignment active and within [startTime, endTime]
        LocalDateTime now = LocalDateTime.now();
        if (assignment.getStatus() != AssignmentStatus.ACTIVE || now.isBefore(assignment.getStartTime())
                || (assignment.getEndTime() != null && now.isAfter(assignment.getEndTime()))) {
            throw new BadRequestException("Quiz assignment is not currently active.");
        }

        // Step 3: Count existing attempts
        int existingAttemptCount = attemptRepo.countByAssignmentIdAndStudentUsername(assignmentId, username);
        if (existingAttemptCount >= assignment.getMaxAttempts()) {
            throw new BadRequestException("Maximum attempt limit of " + assignment.getMaxAttempts() + " reached.");
        }

        // Step 4: Check if student has IN_PROGRESS attempt -> Resume
        Optional<QuizAttemptEntity> inProgressOpt = attemptRepo.findByAssignmentIdAndStudentUsernameAndStatus(assignmentId, username, AttemptStatus.IN_PROGRESS);
        if (inProgressOpt.isPresent()) {
            return resumeAttemptInternal(inProgressOpt.get(), sessionToken);
        }

        // Step 5: Create new attempt
        List<QuizQuestionEntity> questions = questionRepo.findByQuizIdAndDeletedAtIsNullOrderByOrderIndexAsc(quiz.getId());
        if (questions.isEmpty()) {
            throw new BadRequestException("Quiz has no questions.");
        }

        if (Boolean.TRUE.equals(assignment.getShuffleQuestions())) {
            Collections.shuffle(questions);
        }

        List<UUID> questionOrderList = questions.stream().map(QuizQuestionEntity::getId).collect(Collectors.toList());
        String questionOrderJson;
        try {
            questionOrderJson = objectMapper.writeValueAsString(questionOrderList);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize question order", e);
        }

        BigDecimal maxScore = questions.stream()
                .map(QuizQuestionEntity::getPoints)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        QuizAttemptEntity attempt = QuizAttemptEntity.builder()
                .assignmentId(assignmentId)
                .quizId(quiz.getId())
                .studentUsername(username)
                .attemptNumber(existingAttemptCount + 1)
                .status(AttemptStatus.IN_PROGRESS)
                .startedAt(now)
                .expiresAt(now.plusMinutes(assignment.getDurationMinutes()))
                .maxScore(maxScore)
                .questionOrder(questionOrderJson)
                .activeSessionToken(sessionToken)
                .lockAcquiredAt(now)
                .lastHeartbeatAt(now)
                .build();

        attemptRepo.save(attempt);
        auditService.log("ATTEMPT", attempt.getId(), QuizAuditAction.START_ATTEMPT, username, null, attempt, "Started new quiz attempt");

        List<QuizQuestionResponse> questionDtos = buildQuestionsForStudent(questions, assignment.getShuffleOptions());

        return StartAttemptResponse.builder()
                .attemptId(attempt.getId())
                .assignmentId(assignmentId)
                .quizId(quiz.getId())
                .studentUsername(username)
                .attemptNumber(attempt.getAttemptNumber())
                .status(attempt.getStatus())
                .startedAt(attempt.getStartedAt())
                .expiresAt(attempt.getExpiresAt())
                .maxScore(maxScore)
                .activeSessionToken(sessionToken)
                .questions(questionDtos)
                .existingAnswers(Collections.emptyList())
                .build();
    }

    @Override
    public AutosaveResponse autosaveAnswer(UUID attemptId, AutosaveRequest request, String username) {
        LocalDateTime now = LocalDateTime.now();

        // Step 1: Precondition validation
        QuizAttemptEntity attempt = attemptRepo.findById(attemptId)
                .orElseThrow(() -> new DataNotFoundException("Attempt not found with ID: " + attemptId));

        if (!attempt.getStudentUsername().equals(username)) {
            return AutosaveResponse.builder().attemptId(attemptId).questionId(request.getQuestionId()).saved(false).message("Unauthorized attempt owner.").build();
        }

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            return AutosaveResponse.builder().attemptId(attemptId).questionId(request.getQuestionId()).saved(false).message("Attempt is not IN_PROGRESS.").build();
        }

        if (!request.getSessionToken().equals(attempt.getActiveSessionToken())) {
            return AutosaveResponse.builder().attemptId(attemptId).questionId(request.getQuestionId()).saved(false).message("Invalid active session token.").build();
        }

        if (now.isAfter(attempt.getExpiresAt())) {
            return AutosaveResponse.builder().attemptId(attemptId).questionId(request.getQuestionId()).saved(false).message("Attempt duration expired.").build();
        }

        // Check sequence number
        Optional<QuizAttemptAnswerLogEntity> latestLog = answerLogRepo.findFirstByAttemptIdAndQuestionIdOrderByClientSeqDesc(attemptId, request.getQuestionId());
        if (latestLog.isPresent() && latestLog.get().getClientSeq() > request.getClientSeq()) {
            return AutosaveResponse.builder()
                    .attemptId(attemptId)
                    .questionId(request.getQuestionId())
                    .saved(false)
                    .message("Ignored out-of-order autosave request.")
                    .build();
        }

        // Publish event to Kafka for async DB persistence
        try {
            QuizAutosaveLogEvent event = QuizAutosaveLogEvent.builder()
                    .attemptId(attemptId)
                    .questionId(request.getQuestionId())
                    .answerText(request.getAnswerText())
                    .selectedOptionIds(request.getSelectedOptionIds())
                    .clientSeq(request.getClientSeq())
                    .sessionToken(request.getSessionToken())
                    .savedAt(now)
                    .build();

            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(KafkaTopicConstant.QUIZ_AUTOSAVE_LOG_TOPIC, payload);

            return AutosaveResponse.builder()
                    .attemptId(attemptId)
                    .questionId(request.getQuestionId())
                    .autosaveVersion(request.getClientSeq())
                    .lastSavedAt(now)
                    .saved(true)
                    .message("Autosave event sent to Kafka processing queue.")
                    .build();
        } catch (Exception e) {
            log.error("Failed to publish autosave event to Kafka for attemptId={}, questionId={}: {}", attemptId, request.getQuestionId(), e.getMessage(), e);
            return AutosaveResponse.builder()
                    .attemptId(attemptId)
                    .questionId(request.getQuestionId())
                    .saved(false)
                    .message("Autosave failed due to internal error.")
                    .build();
        }
    }

    @Override
    @Transactional
    public StartAttemptResponse resumeAttempt(UUID assignmentId, String username, String sessionToken) {
        QuizAttemptEntity attempt = attemptRepo.findByAssignmentIdAndStudentUsernameAndStatus(assignmentId, username, AttemptStatus.IN_PROGRESS)
                .orElseThrow(() -> new DataNotFoundException("No active attempt found for assignment ID: " + assignmentId));

        return resumeAttemptInternal(attempt, sessionToken);
    }

    private StartAttemptResponse resumeAttemptInternal(QuizAttemptEntity attempt, String sessionToken) {
        LocalDateTime now = LocalDateTime.now();

        // Check if expired -> auto submit
        if (!now.isBefore(attempt.getExpiresAt())) {
            submitAttempt(attempt.getId(), attempt.getStudentUsername());
            throw new BadRequestException("Attempt expired and has been submitted.");
        }

        // Soft-lock check (Flow 9)
        if (!sessionToken.equals(attempt.getActiveSessionToken())) {
            if (attempt.getLastHeartbeatAt() != null && Duration.between(attempt.getLastHeartbeatAt(), now).getSeconds() < 60) {
                throw new AccessDeniedException("Bạn đang làm bài ở thiết bị/tab khác");
            }
            // Steal lock if old session is dead
            attempt.setActiveSessionToken(sessionToken);
            attempt.setLockAcquiredAt(now);
            attempt.setLastHeartbeatAt(now);
            attemptRepo.save(attempt);
        } else {
            attempt.setLastHeartbeatAt(now);
            attemptRepo.save(attempt);
        }

        // Parse question order snapshot
        List<UUID> questionIds = parseQuestionOrder(attempt.getQuestionOrder());
        List<QuizQuestionEntity> questions = new ArrayList<>();
        for (UUID qId : questionIds) {
            questionRepo.findByIdAndDeletedAtIsNull(qId).ifPresent(questions::add);
        }

        QuizAssignmentEntity assignment = assignmentRepo.findByIdAndDeletedAtIsNull(attempt.getAssignmentId())
                .orElseThrow(() -> new DataNotFoundException("Assignment not found with ID: " + attempt.getAssignmentId()));

        List<QuizQuestionResponse> questionDtos = buildQuestionsForStudent(questions, assignment.getShuffleOptions());

        // Fetch existing answers
        List<QuizAttemptAnswerEntity> existingAnswers = answerRepo.findByAttemptId(attempt.getId());
        List<QuizAttemptAnswerEntityDto> existingAnswerDtos = existingAnswers.stream()
                .map(ans -> QuizAttemptAnswerEntityDto.builder()
                        .questionId(ans.getQuestionId())
                        .questionType(ans.getQuestionType())
                        .answerText(ans.getAnswerText())
                        .selectedOptionIds(parseOptionIdsJson(ans.getSelectedOptionIds()))
                        .autosaveVersion(ans.getAutosaveVersion())
                        .lastSavedAt(ans.getLastSavedAt())
                        .build())
                .collect(Collectors.toList());

        return StartAttemptResponse.builder()
                .attemptId(attempt.getId())
                .assignmentId(attempt.getAssignmentId())
                .quizId(attempt.getQuizId())
                .studentUsername(attempt.getStudentUsername())
                .attemptNumber(attempt.getAttemptNumber())
                .status(attempt.getStatus())
                .startedAt(attempt.getStartedAt())
                .expiresAt(attempt.getExpiresAt())
                .maxScore(attempt.getMaxScore())
                .activeSessionToken(attempt.getActiveSessionToken())
                .questions(questionDtos)
                .existingAnswers(existingAnswerDtos)
                .build();
    }

    @Override
    @Transactional
    public SubmitAttemptResponse submitAttempt(UUID attemptId, String username) {
        // Flow 8: Lock row with SELECT FOR UPDATE
        QuizAttemptEntity attempt = attemptRepo.findByIdForUpdate(attemptId)
                .orElseThrow(() -> new DataNotFoundException("Attempt not found with ID: " + attemptId));

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            return SubmitAttemptResponse.builder()
                    .attemptId(attemptId)
                    .status(attempt.getStatus())
                    .submittedAt(attempt.getSubmittedAt())
                    .totalScore(attempt.getTotalScore())
                    .maxScore(attempt.getMaxScore())
                    .build();
        }

        LocalDateTime now = LocalDateTime.now();
        attempt.setStatus(AttemptStatus.SUBMITTED);
        attempt.setSubmittedAt(now);

        // Grade AUTO questions
        List<QuizAttemptAnswerEntity> savedAnswers = answerRepo.findByAttemptId(attemptId);
        Map<UUID, QuizAttemptAnswerEntity> answerMap = savedAnswers.stream()
                .collect(Collectors.toMap(QuizAttemptAnswerEntity::getQuestionId, a -> a));

        List<QuizQuestionEntity> questions = questionRepo.findByQuizIdAndDeletedAtIsNullOrderByOrderIndexAsc(attempt.getQuizId());
        BigDecimal autoTotalScore = BigDecimal.ZERO;
        boolean hasEssayQuestion = false;

        for (QuizQuestionEntity q : questions) {
            if (q.getQuestionType() == QuestionType.ESSAY) {
                hasEssayQuestion = true;
                continue;
            }

            QuizAttemptAnswerEntity answer = answerMap.get(q.getId());
            if (answer == null) {
                continue;
            }

            List<QuizQuestionOptionEntity> correctOptions = optionRepo.findByQuestionIdAndIsCorrectTrueAndDeletedAtIsNull(q.getId());
            Set<UUID> correctOptionIds = correctOptions.stream().map(QuizQuestionOptionEntity::getId).collect(Collectors.toSet());

            List<UUID> selectedOptionIds = parseOptionIdsJson(answer.getSelectedOptionIds());
            Set<UUID> selectedSet = new HashSet<>(selectedOptionIds);

            boolean isCorrect = false;
            BigDecimal awardedPoints = BigDecimal.ZERO;

            if (q.getQuestionType() == QuestionType.SINGLE_CHOICE) {
                if (selectedSet.size() == 1 && correctOptionIds.containsAll(selectedSet)) {
                    isCorrect = true;
                    awardedPoints = q.getPoints();
                }
            } else if (q.getQuestionType() == QuestionType.MULTIPLE_CHOICE) {
                // Exact match logic (no extra, no missing)
                if (selectedSet.equals(correctOptionIds)) {
                    isCorrect = true;
                    awardedPoints = q.getPoints();
                }
            }

            answer.setIsCorrect(isCorrect);
            answer.setAwardedPoints(awardedPoints);
            answerRepo.save(answer);

            autoTotalScore = autoTotalScore.add(awardedPoints);
        }

        if (hasEssayQuestion) {
            attempt.setStatus(AttemptStatus.GRADING);
            attempt.setTotalScore(autoTotalScore);
        } else {
            attempt.setStatus(AttemptStatus.GRADED);
            attempt.setGradedAt(now);
            attempt.setTotalScore(autoTotalScore);
        }

        attemptRepo.save(attempt);
        auditService.log("ATTEMPT", attemptId, QuizAuditAction.SUBMIT, username, null, attempt, "Submitted quiz attempt");

        return SubmitAttemptResponse.builder()
                .attemptId(attemptId)
                .status(attempt.getStatus())
                .submittedAt(now)
                .totalScore(attempt.getTotalScore())
                .maxScore(attempt.getMaxScore())
                .build();
    }

    @Override
    @Transactional
    public void heartbeat(UUID attemptId, HeartbeatRequest request, String username) {
        QuizAttemptEntity attempt = attemptRepo.findById(attemptId)
                .orElseThrow(() -> new DataNotFoundException("Attempt not found with ID: " + attemptId));

        if (!attempt.getStudentUsername().equals(username)) {
            throw new AccessDeniedException("Unauthorized attempt access.");
        }

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        if (request.getSessionToken().equals(attempt.getActiveSessionToken())) {
            attempt.setLastHeartbeatAt(now);
            attemptRepo.save(attempt);
        } else {
            if (attempt.getLastHeartbeatAt() != null && Duration.between(attempt.getLastHeartbeatAt(), now).getSeconds() < 60) {
                throw new AccessDeniedException("Bạn đang làm bài ở thiết bị/tab khác");
            }
            attempt.setActiveSessionToken(request.getSessionToken());
            attempt.setLockAcquiredAt(now);
            attempt.setLastHeartbeatAt(now);
            attemptRepo.save(attempt);
        }
    }

    @Override
    public AttemptResultResponse getAttemptResult(UUID attemptId, String username, boolean isStaff) {
        QuizAttemptEntity attempt = attemptRepo.findById(attemptId)
                .orElseThrow(() -> new DataNotFoundException("Attempt not found with ID: " + attemptId));

        if (!isStaff && !attempt.getStudentUsername().equals(username)) {
            throw new AccessDeniedException("Unauthorized attempt access.");
        }

        // Security check: If not GRADED, MUST NOT reveal results/answers!
        if (attempt.getStatus() != AttemptStatus.GRADED) {
            throw new BadRequestException("Results are not available until grading is complete.");
        }

        List<QuizQuestionEntity> questions = questionRepo.findByQuizIdAndDeletedAtIsNullOrderByOrderIndexAsc(attempt.getQuizId());
        List<QuizAttemptAnswerEntity> answers = answerRepo.findByAttemptId(attemptId);
        Map<UUID, QuizAttemptAnswerEntity> answerMap = answers.stream().collect(Collectors.toMap(QuizAttemptAnswerEntity::getQuestionId, a -> a));

        List<AttemptAnswerResultDto> answerResults = new ArrayList<>();
        for (QuizQuestionEntity q : questions) {
            QuizAttemptAnswerEntity ans = answerMap.get(q.getId());
            List<QuizQuestionOptionEntity> options = optionRepo.findByQuestionIdAndDeletedAtIsNullOrderByOrderIndexAsc(q.getId());

            // Expose is_correct on options ONLY when status is GRADED
            List<QuizQuestionOptionResponse> optionResponses = quizMapper.toOptionResponseList(options);

            AttemptAnswerResultDto.AttemptAnswerResultDtoBuilder builder = AttemptAnswerResultDto.builder()
                    .questionId(q.getId())
                    .questionType(q.getQuestionType())
                    .questionContent(q.getContent())
                    .questionPoints(q.getPoints())
                    .options(optionResponses);

            if (ans != null) {
                builder.answerText(ans.getAnswerText())
                        .selectedOptionIds(parseOptionIdsJson(ans.getSelectedOptionIds()))
                        .isCorrect(ans.getIsCorrect())
                        .awardedPoints(ans.getAwardedPoints())
                        .gradedBy(ans.getGradedBy())
                        .gradedAt(ans.getGradedAt());
            }

            answerResults.add(builder.build());
        }

        return AttemptResultResponse.builder()
                .attemptId(attempt.getId())
                .assignmentId(attempt.getAssignmentId())
                .quizId(attempt.getQuizId())
                .studentUsername(attempt.getStudentUsername())
                .attemptNumber(attempt.getAttemptNumber())
                .status(attempt.getStatus())
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .gradedAt(attempt.getGradedAt())
                .totalScore(attempt.getTotalScore())
                .maxScore(attempt.getMaxScore())
                .answers(answerResults)
                .build();
    }

    private List<QuizQuestionResponse> buildQuestionsForStudent(List<QuizQuestionEntity> questions, Boolean shuffleOptions) {
        List<QuizQuestionResponse> list = new ArrayList<>();
        for (QuizQuestionEntity q : questions) {
            QuizQuestionResponse dto = quizMapper.toResponse(q);
            List<QuizQuestionOptionEntity> options = optionRepo.findByQuestionIdAndDeletedAtIsNullOrderByOrderIndexAsc(q.getId());
            if (Boolean.TRUE.equals(shuffleOptions) && !options.isEmpty()) {
                options = new ArrayList<>(options);
                Collections.shuffle(options);
            }
            // Hide is_correct from student during attempt
            List<QuizQuestionOptionResponse> optionDtos = options.stream()
                    .map(opt -> QuizQuestionOptionResponse.builder()
                            .id(opt.getId())
                            .questionId(opt.getQuestionId())
                            .optionText(opt.getOptionText())
                            .orderIndex(opt.getOrderIndex())
                            .isCorrect(null) // STRICT HIDE
                            .build())
                    .collect(Collectors.toList());
            dto.setOptions(optionDtos);
            list.add(dto);
        }
        return list;
    }

    private List<UUID> parseQuestionOrder(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<UUID>>() {
            });
        } catch (Exception e) {
            log.error("Failed to parse question order JSON", e);
            return Collections.emptyList();
        }
    }

    private List<UUID> parseOptionIdsJson(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<UUID>>() {
            });
        } catch (Exception e) {
            log.error("Failed to parse selected option IDs JSON", e);
            return Collections.emptyList();
        }
    }
}
