package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.chat.service.OpenAiService;
import com.pht.dev_edu.course.entity.CourseEntity;
import com.pht.dev_edu.course.repo.CourseRepository;
import com.pht.dev_edu.quiz.entity.DocumentKnowledgeChunkEntity;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseRelevanceEvaluatorImpl implements CourseRelevanceEvaluator {
    CourseRepository courseRepository;
    OpenAiService openAiService;

    private static final double MIN_RELEVANCE_THRESHOLD = 0.25;
    private static final double FULL_RELEVANCE_THRESHOLD = 0.40;

    @Override
    public EvaluationOutcome evaluateRelevance(UUID courseId, List<DocumentKnowledgeChunkEntity> chunks) {
        if (chunks == null || chunks.isEmpty()) {
            return EvaluationOutcome.builder()
                    .status(RelevanceStatus.NOT_RELEVANT)
                    .relevanceScore(0.0)
                    .reason("Document contains no valid knowledge chunks.")
                    .eligibleChunks(Collections.emptyList())
                    .build();
        }

        CourseEntity course = courseRepository.findById(courseId).orElse(null);
        String courseTitle = course != null ? course.getTitle() : "Course";
        String courseDesc = course != null && course.getDescription() != null ? course.getDescription() : courseTitle;

        String courseContextText = "Course title: " + courseTitle + ". Description: " + courseDesc;
        List<Float> courseEmbedding = openAiService.createEmbedding(courseContextText);

        List<DocumentKnowledgeChunkEntity> eligibleChunks = new ArrayList<>();
        double totalSim = 0.0;

        for (DocumentKnowledgeChunkEntity chunk : chunks) {
            List<Float> chunkVec = parseVectorString(chunk.getEmbedding());
            double sim = cosineSimilarity(courseEmbedding, chunkVec);
            totalSim += sim;

            if (sim >= MIN_RELEVANCE_THRESHOLD) {
                eligibleChunks.add(chunk);
            }
        }

        double avgScore = totalSim / chunks.size();
        log.info("Evaluated course relevance for courseId {}: avgScore={}, eligible={}/{}",
                courseId, avgScore, eligibleChunks.size(), chunks.size());

        if (avgScore >= FULL_RELEVANCE_THRESHOLD || eligibleChunks.size() == chunks.size()) {
            return EvaluationOutcome.builder()
                    .status(RelevanceStatus.RELEVANT)
                    .relevanceScore(avgScore)
                    .reason("Document content is highly relevant to course '" + courseTitle + "'.")
                    .eligibleChunks(chunks)
                    .build();
        } else if (eligibleChunks.size() > 0 && avgScore >= MIN_RELEVANCE_THRESHOLD) {
            return EvaluationOutcome.builder()
                    .status(RelevanceStatus.PARTIALLY_RELEVANT)
                    .relevanceScore(avgScore)
                    .reason("Document is partially relevant to course '" + courseTitle + "'. Filtering " + eligibleChunks.size() + "/" + chunks.size() + " relevant chunks.")
                    .eligibleChunks(eligibleChunks)
                    .build();
        } else {
            return EvaluationOutcome.builder()
                    .status(RelevanceStatus.NOT_RELEVANT)
                    .relevanceScore(avgScore)
                    .reason("Document content is not relevant to course '" + courseTitle + "'. Quiz generation rejected.")
                    .eligibleChunks(Collections.emptyList())
                    .build();
        }
    }

    private List<Float> parseVectorString(String vecStr) {
        if (vecStr == null || vecStr.isEmpty()) return Collections.emptyList();
        String cleaned = vecStr.replace("[", "").replace("]", "").trim();
        if (cleaned.isEmpty()) return Collections.emptyList();
        String[] parts = cleaned.split(",");
        List<Float> vec = new ArrayList<>(parts.length);
        for (String p : parts) {
            vec.add(Float.parseFloat(p.trim()));
        }
        return vec;
    }

    private double cosineSimilarity(List<Float> vecA, List<Float> vecB) {
        if (vecA.isEmpty() || vecB.isEmpty() || vecA.size() != vecB.size()) return 0.0;
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < vecA.size(); i++) {
            float a = vecA.get(i);
            float b = vecB.get(i);
            dotProduct += a * b;
            normA += a * a;
            normB += b * b;
        }
        if (normA == 0.0 || normB == 0.0) return 0.0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
