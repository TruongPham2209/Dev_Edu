package com.pht.dev_edu.chat.service;

import com.pht.dev_edu.chat.dto.openai.OpenAiChatResponse;
import com.pht.dev_edu.chat.dto.openai.OpenAiMessage;
import com.pht.dev_edu.chat.dto.openai.OpenAiTool;

import java.util.List;

/**
 * Service for direct communication with the OpenAI API (Chat Completions, Text Embeddings, Tool/Function Calling).
 */
public interface OpenAiService {

    /**
     * Generates a 1536-dimensional text vector embedding using OpenAI's embedding model.
     *
     * @param text the input text to embed.
     * @return the list of float values representing the embedding.
     */
    List<Float> createEmbedding(String text);

    /**
     * Executes a chat completion request to OpenAI with the provided conversation history and tools.
     *
     * @param messages the list of conversation {@link OpenAiMessage} objects.
     * @param tools    the list of {@link OpenAiTool} definitions available for the model to call.
     * @return the {@link OpenAiChatResponse} containing the model's response.
     */
    OpenAiChatResponse chatCompletion(List<OpenAiMessage> messages, List<OpenAiTool> tools);

    /**
     * Retrieves the tool definitions for course search and recommendation.
     *
     * @return a list of {@link OpenAiTool} schemas.
     */
    List<OpenAiTool> getCourseRecommendationTools();
}
