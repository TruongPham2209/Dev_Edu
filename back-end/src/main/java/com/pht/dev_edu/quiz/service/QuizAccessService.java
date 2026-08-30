package com.pht.dev_edu.quiz.service;

import java.util.Set;
import java.util.UUID;

/**
 * Service for access control and authorization checks on quizzes and related courses.
 */
public interface QuizAccessService {

    /**
     * Validates if the user has access permission to a specific course.
     *
     * @param username    the username of the user.
     * @param authorities the authorities/roles of the user.
     * @param courseId    the UUID of the course.
     */
    void validateAccessByCourse(String username, Set<String> authorities, UUID courseId);

    /**
     * Validates if the user has management or access permission to a specific quiz.
     *
     * @param username    the username of the user.
     * @param authorities the authorities/roles of the user.
     * @param quizId      the UUID of the quiz.
     */
    void validateAccessByQuiz(String username, Set<String> authorities, UUID quizId);
}
