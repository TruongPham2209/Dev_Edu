package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.quiz.entity.DocumentKnowledgeChunkEntity;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

/**
 * Interface đánh giá độ liên quan ngữ nghĩa (Semantic Relevance) giữa tài liệu đầu vào và thông tin khóa học.
 * Sử dụng Cosine Similarity giữa Vector Embedding của tài liệu và Metadata khóa học để phân loại và lọc bớt các phần rác.
 */
public interface CourseRelevanceEvaluator {
    enum RelevanceStatus {
        RELEVANT,
        PARTIALLY_RELEVANT,
        NOT_RELEVANT
    }

    @Getter
    @Builder
    class EvaluationOutcome {
        RelevanceStatus status;
        double relevanceScore;
        String reason;
        List<DocumentKnowledgeChunkEntity> eligibleChunks;
    }

    /**
     * Đánh giá độ tương quan của danh sách các Knowledge Chunks với môn học chỉ định.
     *
     * @@param courseId ID khóa học cần đối chiếu
     * @param chunks   Danh sách các kiến thức phân đoạn trích xuất từ tài liệu
     * @return EvaluationOutcome chứa trạng thái (RELEVANT/PARTIALLY_RELEVANT/NOT_RELEVANT) và danh sách chunk hợp lệ
     */
    EvaluationOutcome evaluateRelevance(UUID courseId, List<DocumentKnowledgeChunkEntity> chunks);
}
