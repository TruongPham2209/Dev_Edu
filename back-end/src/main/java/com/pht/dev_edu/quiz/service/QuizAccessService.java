package com.pht.dev_edu.quiz.service;

import java.util.Set;
import java.util.UUID;

public interface QuizAccessService {
    void validateAccessByCourse(String username, Set<String> authorities, UUID courseId);

    void validateAccessByQuiz(String username, Set<String> authorities, UUID quizId);
}
