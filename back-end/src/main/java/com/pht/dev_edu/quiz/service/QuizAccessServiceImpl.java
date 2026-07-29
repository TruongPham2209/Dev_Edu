package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.lecture.service.LecturePermissionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizAccessServiceImpl implements QuizAccessService {
    QuizService  quizService;
    LecturePermissionService lecturePermissionService;

    @Override
    public void validateAccessByCourse(String username, Set<String> authorities, UUID courseId) {
        lecturePermissionService.checkViewPermissionByCourse(authorities, username, courseId);
    }

    @Override
    public void validateAccessByQuiz(String username, Set<String> authorities, UUID quizId) {
        var quiz = quizService.getQuizEntityOrThrow(quizId);
        if (authorities.contains(RoleEnum.ADMIN.name())) {
            return;
        }

        validateAccessByCourse(username, authorities, quiz.getCourseId());
    }
}
