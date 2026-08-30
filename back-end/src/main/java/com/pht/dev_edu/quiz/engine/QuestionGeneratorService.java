package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.quiz.dto.engine.GeneratedQuestionContract;
import com.pht.dev_edu.quiz.dto.engine.QuestionSlot;

/**
 * Service for interacting with Large Language Models (LLM - OpenAI GPT)
 * to generate structured JSON question content based on provided context.
 */
public interface QuestionGeneratorService {

    /**
     * Sends a prompt to OpenAI to generate a question matching the question slot specification and source context.
     *
     * @param slot          the {@link QuestionSlot} defining question type, difficulty, and topic.
     * @param context       the {@link KnowledgeRetrieverService.RetrievedContext} source context.
     * @param retryFeedback the failure reason from a previous iteration (if retrying).
     * @return the {@link GeneratedQuestionContract} containing question text, options, correct answer, and explanation.
     */
    GeneratedQuestionContract generateQuestion(
            QuestionSlot slot,
            KnowledgeRetrieverService.RetrievedContext context,
            String retryFeedback
    );
}
