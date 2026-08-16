package com.pht.dev_edu.chat.service;

import com.pht.dev_edu.chat.dto.openai.*;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OpenAiServiceImpl implements OpenAiService {
    RestClient restClient;
    String chatModel;
    String embeddingModel;

    public OpenAiServiceImpl(
            @Value("${openai.api-key:}") String apiKey,
            @Value("${openai.chat-model:gpt-4o-mini}") String chatModel,
            @Value("${openai.embedding-model:text-embedding-3-small}") String embeddingModel) {
        this.chatModel = chatModel;
        this.embeddingModel = embeddingModel;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.openai.com")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }

    @Override
    public List<Float> createEmbedding(String text) {
        OpenAiEmbeddingRequest request = OpenAiEmbeddingRequest.builder()
                .model(embeddingModel)
                .input(text)
                .build();

        OpenAiEmbeddingResponse response = restClient.post()
                .uri("/v1/embeddings")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(OpenAiEmbeddingResponse.class);

        if (response != null && response.getData() != null && !response.getData().isEmpty()) {
            return response.getData().get(0).getEmbedding();
        }
        throw new IllegalStateException("Failed to generate embedding from OpenAI");
    }

    @Override
    public OpenAiChatResponse chatCompletion(List<OpenAiMessage> messages, List<OpenAiTool> tools) {
        OpenAiChatRequest request = OpenAiChatRequest.builder()
                .model(chatModel)
                .messages(messages)
                .tools(tools)
                .maxTokens(1000)
                .temperature(0.7)
                .build();

        return restClient.post()
                .uri("/v1/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(OpenAiChatResponse.class);
    }

    @Override
    public List<OpenAiTool> getCourseRecommendationTools() {
        // Tool 1: search_courses_semantic
        Map<String, Object> queryProp = Map.of(
                "type", "string",
                "description", "Nhu cầu hoặc từ khoá tìm kiếm khoá học của người dùng"
        );
        Map<String, Object> semanticParams = Map.of(
                "type", "object",
                "properties", Map.of("query", queryProp),
                "required", List.of("query")
        );

        OpenAiTool semanticTool = OpenAiTool.builder()
                .type("function")
                .function(OpenAiTool.FunctionSpec.builder()
                        .name("search_courses_semantic")
                        .description("Tìm khoá học phù hợp theo mô tả nhu cầu tự nhiên của người dùng (không phải filter chính xác)")
                        .parameters(semanticParams)
                        .build())
                .build();

        // Tool 2: search_courses_filtered
        Map<String, Object> filteredProps = new HashMap<>();
        filteredProps.put("category", Map.of("type", "string", "description", "Danh mục khoá học"));
        filteredProps.put("level", Map.of(
                "type", "string",
                "enum", List.of("beginner", "intermediate", "advanced"),
                "description", "Trình độ khoá học"
        ));
        filteredProps.put("priceMin", Map.of("type", "number", "description", "Giá tối thiểu"));
        filteredProps.put("priceMax", Map.of("type", "number", "description", "Giá tối đa"));

        Map<String, Object> filteredParams = Map.of(
                "type", "object",
                "properties", filteredProps
        );

        OpenAiTool filteredTool = OpenAiTool.builder()
                .type("function")
                .function(OpenAiTool.FunctionSpec.builder()
                        .name("search_courses_filtered")
                        .description("Tìm khoá học theo điều kiện lọc cụ thể")
                        .parameters(filteredParams)
                        .build())
                .build();

        return List.of(semanticTool, filteredTool);
    }
}
