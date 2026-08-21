package com.pht.dev_edu.quiz.engine;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.chat.dto.openai.OpenAiChatResponse;
import com.pht.dev_edu.chat.dto.openai.OpenAiMessage;
import com.pht.dev_edu.chat.service.OpenAiService;
import com.pht.dev_edu.common.exception.server.ServerInternalException;
import com.pht.dev_edu.quiz.dto.engine.GeneratedQuestionContract;
import com.pht.dev_edu.quiz.dto.engine.QuestionSlot;
import com.pht.dev_edu.quiz.entity.DocumentKnowledgeChunkEntity;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuestionGeneratorServiceImpl implements QuestionGeneratorService {
    OpenAiService openAiService;
    ObjectMapper objectMapper;

    public QuestionGeneratorServiceImpl(OpenAiService openAiService) {
        this.openAiService = openAiService;
        this.objectMapper = new ObjectMapper()
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    @Override
    public GeneratedQuestionContract generateQuestion(
            QuestionSlot slot,
            KnowledgeRetrieverService.RetrievedContext context,
            String retryFeedback) {

        String systemPrompt = """
                You are an elite educational assessment author.
                Your task is to generate ONE highly accurate quiz question strictly based on the provided Knowledge Source text.

                STRICT CONSTRAINTS:
                1. GROUNDING RULE: Every fact, statement, question, option, and explanation MUST be directly supported by the provided Knowledge Source text. NEVER use external pre-trained knowledge or introduce unsupported claims.
                2. QUESTION TYPE RULE: You MUST generate a question of type '%s'.
                   - If SINGLE_CHOICE: provide exactly 4 options with EXACTLY 1 correct option (isCorrect: true) and 3 incorrect options.
                   - If MULTIPLE_CHOICE: provide 4 options with at least 2 correct options (isCorrect: true).
                   - If ESSAY: provide NO options (empty list), but supply a clear sample answer key in explanation.
                3. DIFFICULTY RULE: Target difficulty level '%s'.
                4. OUTPUT FORMAT: Output ONLY raw JSON matching this structure without Markdown formatting:
                   {
                     "questionType": "%s",
                     "difficulty": "%s",
                     "content": "question text",
                     "points": 1.0,
                     "explanation": "detailed explanation referencing source evidence",
                     "options": [
                        {"optionText": "option 1", "isCorrect": true/false},
                        {"optionText": "option 2", "isCorrect": true/false}
                     ]
                   }
                """
                .formatted(slot.getQuestionType(), slot.getDifficulty(), slot.getQuestionType(), slot.getDifficulty());

        StringBuilder userPromptSb = new StringBuilder();
        userPromptSb.append("Target Question Type: ").append(slot.getQuestionType()).append("\n");
        userPromptSb.append("Target Difficulty: ").append(slot.getDifficulty()).append("\n");
        userPromptSb.append("Target Topic Area: ").append(slot.getTargetTopic()).append("\n\n");
        userPromptSb.append(context.getContextText());

        if (retryFeedback != null && !retryFeedback.isBlank()) {
            userPromptSb.append("\nATTENTION - PREVIOUS ATTEMPT FAILED WITH REASON: ")
                    .append(retryFeedback)
                    .append("\nPlease fix this issue and generate a valid, compliant question.");
        }

        List<OpenAiMessage> messages = List.of(
                OpenAiMessage.builder().role("system").content(systemPrompt).build(),
                OpenAiMessage.builder().role("user").content(userPromptSb.toString()).build());

        log.info("Requesting question generation from OpenAI for slot {} ({}, {})",
                slot.getSlotIndex(), slot.getQuestionType(), slot.getDifficulty());

        OpenAiChatResponse response = openAiService.chatCompletion(messages, null);
        if (response == null || response.getChoices() == null || response.getChoices().isEmpty()) {
            throw new ServerInternalException("OpenAI returned an empty response during question generation.");
        }

        String rawContent = response.getChoices().get(0).getMessage().getContent();
        try {
            String cleanJson = cleanJsonOutput(rawContent);
            GeneratedQuestionContract contract = objectMapper.readValue(cleanJson, GeneratedQuestionContract.class);

            contract.setQuestionType(slot.getQuestionType());
            contract.setDifficulty(slot.getDifficulty());
            if (contract.getPoints() == null || contract.getPoints().compareTo(BigDecimal.ZERO) <= 0) {
                contract.setPoints(BigDecimal.valueOf(1.0));
            }

            if (context.getSourceChunks() != null && !context.getSourceChunks().isEmpty()) {
                DocumentKnowledgeChunkEntity primaryChunk = context.getSourceChunks().get(0);
                contract.setSourceChunkId(primaryChunk.getId());
                contract.setSourceSection(primaryChunk.getSectionName());
                contract.setSourcePage(primaryChunk.getPageNumber());
            }

            return contract;
        } catch (Exception e) {
            log.error("Failed to parse OpenAI JSON output: {}", rawContent, e);
            throw new ServerInternalException(
                    "Invalid JSON format produced by LLM question generator: " + e.getMessage());
        }
    }

    private String cleanJsonOutput(String text) {
        if (text == null)
            return "{}";
        String trimmed = text.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
    }
}
