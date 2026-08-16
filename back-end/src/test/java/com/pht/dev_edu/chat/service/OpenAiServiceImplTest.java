package com.pht.dev_edu.chat.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClient;

import com.pht.dev_edu.chat.dto.openai.OpenAiChatRequest;
import com.pht.dev_edu.chat.dto.openai.OpenAiChatResponse;
import com.pht.dev_edu.chat.dto.openai.OpenAiEmbeddingRequest;
import com.pht.dev_edu.chat.dto.openai.OpenAiEmbeddingResponse;
import com.pht.dev_edu.chat.dto.openai.OpenAiMessage;
import com.pht.dev_edu.chat.dto.openai.OpenAiTool;

/*
 * <analysis>
 * OpenAiServiceImpl
 * - createEmbedding(String text)
 *   - branches:
 *       response is null or response.getData() is null/empty -> throw IllegalStateException
 *       response with valid data -> return List<Float> embedding
 *   - paths:
 *       [P1: valid embedding response returns float list]
 *       [P2: empty/null embedding response throws IllegalStateException]
 *   - planned tests:
 *       [shouldCreateEmbeddingSuccessfully -> P1]
 *       [shouldThrowIllegalStateExceptionWhenEmbeddingResponseIsEmpty -> P2]
 *
 * - chatCompletion(List<OpenAiMessage> messages, List<OpenAiTool> tools)
 *   - branches:
 *       posts chat request to OpenAI API endpoint and returns OpenAiChatResponse
 *   - paths:
 *       [P1: send chat request and return OpenAiChatResponse]
 *   - planned tests:
 *       [shouldReturnChatCompletionResponse -> P1]
 *
 * - getCourseRecommendationTools()
 *   - branches:
 *       constructs and returns semantic and filtered recommendation tools
 *   - paths:
 *       [P1: return course recommendation tool specifications]
 *   - planned tests:
 *       [shouldGetCourseRecommendationTools -> P1]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for OpenAiServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify OpenAI integration service operations including embedding generation,
 * chat completions, and tool definitions.
 *
 * Test Scope
 * ----------
 * - createEmbedding()
 * - chatCompletion()
 * - getCourseRecommendationTools()
 *
 * Covered Scenarios
 * -----------------
 * ✓ Successful vector embedding creation from text
 * ✓ Error handling when OpenAI embedding response is empty or null
 * ✓ Chat completion request execution via Spring RestClient
 * ✓ Tool definition specifications for course recommendations
 *
 * Mocked Dependencies
 * -------------------
 * - RestClient
 */
@ExtendWith(MockitoExtension.class)
class OpenAiServiceImplTest {

    private OpenAiServiceImpl openAiService;
    private RestClient restClient;
    private RestClient.RequestBodyUriSpec requestBodyUriSpec;
    private RestClient.RequestBodySpec requestBodySpec;
    private RestClient.ResponseSpec responseSpec;

    private static final String API_KEY = "test-api-key";
    private static final String CHAT_MODEL = "gpt-4o-mini";
    private static final String EMBEDDING_MODEL = "text-embedding-3-small";

    @BeforeEach
    void setUp() {
        openAiService = new OpenAiServiceImpl(API_KEY, CHAT_MODEL, EMBEDDING_MODEL);
        restClient = mock(RestClient.class);
        requestBodyUriSpec = mock(RestClient.RequestBodyUriSpec.class);
        requestBodySpec = mock(RestClient.RequestBodySpec.class);
        responseSpec = mock(RestClient.ResponseSpec.class);

        ReflectionTestUtils.setField(openAiService, "restClient", restClient);
    }

    // ==================== createEmbedding ====================

    @Test
    @DisplayName("createEmbedding - should create embedding vector successfully when response is valid")
    void shouldCreateEmbeddingSuccessfully() {
        // Arrange
        String inputTest = "Java programming course";
        List<Float> expectedVector = List.of(0.1f, 0.2f, 0.3f);

        OpenAiEmbeddingResponse.EmbeddingData data = new OpenAiEmbeddingResponse.EmbeddingData();
        data.setEmbedding(expectedVector);

        OpenAiEmbeddingResponse mockResponse = new OpenAiEmbeddingResponse();
        mockResponse.setData(List.of(data));

        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri("/v1/embeddings")).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(MediaType.APPLICATION_JSON)).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any(OpenAiEmbeddingRequest.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.body(OpenAiEmbeddingResponse.class)).thenReturn(mockResponse);

        // Act
        List<Float> result = openAiService.createEmbedding(inputTest);

        // Assert
        assertThat(result).isNotNull().isEqualTo(expectedVector);
        verify(restClient).post();
    }

    @Test
    @DisplayName("createEmbedding - should throw IllegalStateException when response data is empty")
    void shouldThrowIllegalStateExceptionWhenEmbeddingResponseIsEmpty() {
        // Arrange
        String inputTest = "Unknown course";
        OpenAiEmbeddingResponse mockResponse = new OpenAiEmbeddingResponse();
        mockResponse.setData(Collections.emptyList());

        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri("/v1/embeddings")).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(MediaType.APPLICATION_JSON)).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any(OpenAiEmbeddingRequest.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.body(OpenAiEmbeddingResponse.class)).thenReturn(mockResponse);

        // Act & Assert
        assertThatThrownBy(() -> openAiService.createEmbedding(inputTest))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Failed to generate embedding from OpenAI");
    }

    // ==================== chatCompletion ====================

    @Test
    @DisplayName("chatCompletion - should return chat completion response successfully")
    void shouldReturnChatCompletionResponse() {
        // Arrange
        List<OpenAiMessage> messages = List.of(
                OpenAiMessage.builder().role("user").content("Hello").build()
        );
        OpenAiChatResponse mockResponse = new OpenAiChatResponse();

        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri("/v1/chat/completions")).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(MediaType.APPLICATION_JSON)).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any(OpenAiChatRequest.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.body(OpenAiChatResponse.class)).thenReturn(mockResponse);

        // Act
        OpenAiChatResponse result = openAiService.chatCompletion(messages, null);

        // Assert
        assertThat(result).isNotNull().isEqualTo(mockResponse);
        verify(restClient).post();
    }

    // ==================== getCourseRecommendationTools ====================

    @Test
    @DisplayName("getCourseRecommendationTools - should return semantic and filtered tool specifications")
    void shouldGetCourseRecommendationTools() {
        // Act
        List<OpenAiTool> tools = openAiService.getCourseRecommendationTools();

        // Assert
        assertThat(tools).isNotNull().hasSize(2);
        assertThat(tools.get(0).getFunction().getName()).isEqualTo("search_courses_semantic");
        assertThat(tools.get(1).getFunction().getName()).isEqualTo("search_courses_filtered");
    }
}
