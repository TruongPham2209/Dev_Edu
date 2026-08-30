package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.quiz.dto.engine.QuestionSlot;
import com.pht.dev_edu.quiz.entity.DocumentKnowledgeChunkEntity;

import java.util.List;

/**
 * Service for retrieving target knowledge contexts for specific question slots,
 * supplying source text and citations (chapter, page, document) to the LLM prompt.
 */
public interface KnowledgeRetrieverService {

    /**
     * Holds retrieved knowledge context text and associated chunk entities.
     */
    class RetrievedContext {
        private final String contextText;
        private final List<DocumentKnowledgeChunkEntity> sourceChunks;

        public RetrievedContext(String contextText, List<DocumentKnowledgeChunkEntity> sourceChunks) {
            this.contextText = contextText;
            this.sourceChunks = sourceChunks;
        }

        public String getContextText() {
            return contextText;
        }

        public List<DocumentKnowledgeChunkEntity> getSourceChunks() {
            return sourceChunks;
        }
    }

    /**
     * Retrieves the best knowledge context for a question slot from eligible knowledge chunks.
     *
     * @param slot              the {@link QuestionSlot} currently being processed.
     * @param allEligibleChunks the list of eligible {@link DocumentKnowledgeChunkEntity} chunks.
     * @return the {@link RetrievedContext} containing text and selected chunks.
     */
    RetrievedContext retrieveContextForSlot(QuestionSlot slot, List<DocumentKnowledgeChunkEntity> allEligibleChunks);
}
