package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.quiz.dto.engine.QuestionSlot;
import com.pht.dev_edu.quiz.entity.DocumentKnowledgeChunkEntity;
import com.pht.dev_edu.quiz.repo.DocumentKnowledgeChunkRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class KnowledgeRetrieverServiceImpl implements KnowledgeRetrieverService {
    DocumentKnowledgeChunkRepository chunkRepository;

    @Override
    public RetrievedContext retrieveContextForSlot(QuestionSlot slot, List<DocumentKnowledgeChunkEntity> allEligibleChunks) {
        List<DocumentKnowledgeChunkEntity> matchedChunks = new ArrayList<>();

        if (slot.getTargetChunkIds() != null && !slot.getTargetChunkIds().isEmpty()) {
            for (UUID chunkId : slot.getTargetChunkIds()) {
                chunkRepository.findById(chunkId).ifPresent(matchedChunks::add);
            }
        }

        if (matchedChunks.isEmpty() && allEligibleChunks != null && !allEligibleChunks.isEmpty()) {
            int fallbackIdx = (slot.getSlotIndex() - 1) % allEligibleChunks.size();
            matchedChunks.add(allEligibleChunks.get(fallbackIdx));
        }

        StringBuilder sb = new StringBuilder();
        for (DocumentKnowledgeChunkEntity chunk : matchedChunks) {
            sb.append("=== KNOWLEDGE SOURCE START ===\n")
                    .append("Document: ").append(chunk.getDocumentName()).append("\n")
                    .append("Section: ").append(chunk.getSectionName() != null ? chunk.getSectionName() : "N/A").append("\n")
                    .append("Page: ").append(chunk.getPageNumber() != null ? chunk.getPageNumber() : 1).append("\n")
                    .append("Chunk ID: ").append(chunk.getId()).append("\n")
                    .append("Content:\n").append(chunk.getContent()).append("\n")
                    .append("=== KNOWLEDGE SOURCE END ===\n\n");
        }

        return new RetrievedContext(sb.toString(), matchedChunks);
    }
}
