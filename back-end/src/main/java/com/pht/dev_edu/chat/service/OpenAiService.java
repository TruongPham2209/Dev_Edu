package com.pht.dev_edu.chat.service;

import com.pht.dev_edu.chat.dto.openai.OpenAiChatResponse;
import com.pht.dev_edu.chat.dto.openai.OpenAiMessage;
import com.pht.dev_edu.chat.dto.openai.OpenAiTool;

import java.util.List;

public interface OpenAiService {
    List<Float> createEmbedding(String text);

    OpenAiChatResponse chatCompletion(List<OpenAiMessage> messages, List<OpenAiTool> tools);

    List<OpenAiTool> getCourseRecommendationTools();
}
