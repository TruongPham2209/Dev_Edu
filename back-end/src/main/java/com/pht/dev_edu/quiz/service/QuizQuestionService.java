package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.quiz.dto.request.QuizQuestionRequest;
import com.pht.dev_edu.quiz.dto.response.QuizQuestionResponse;

import java.util.Set;
import java.util.UUID;

/**
 * Service for managing questions and answer options within quizzes.
 */
public interface QuizQuestionService {

    /**
     * Adds a new question with its answer choices to a quiz.
     *
     * @param quizId      the UUID of the quiz.
     * @param request     the {@link QuizQuestionRequest} containing question text, question type, difficulty, points, and answer options.
     * @param username    the username of the user adding the question.
     * @param authorities the authorities/roles of the user.
     * @return the created {@link QuizQuestionResponse}.
     */
    QuizQuestionResponse addQuestion(UUID quizId, QuizQuestionRequest request, String username, Set<String> authorities);

    /**
     * Updates an existing question and its answer choices.
     *
     * @param quizId      the UUID of the quiz.
     * @param questionId  the UUID of the question to update.
     * @param request     the {@link QuizQuestionRequest} containing updated data.
     * @param username    the username of the user.
     * @param authorities the authorities/roles of the user.
     * @return the updated {@link QuizQuestionResponse}.
     */
    QuizQuestionResponse updateQuestion(UUID quizId, UUID questionId, QuizQuestionRequest request, String username, Set<String> authorities);

    /**
     * Deletes a question from a quiz.
     *
     * @param quizId      the UUID of the quiz.
     * @param questionId  the UUID of the question to delete.
     * @param username    the username of the user requesting deletion.
     * @param authorities the authorities/roles of the user.
     */
    void deleteQuestion(UUID quizId, UUID questionId, String username, Set<String> authorities);
}
