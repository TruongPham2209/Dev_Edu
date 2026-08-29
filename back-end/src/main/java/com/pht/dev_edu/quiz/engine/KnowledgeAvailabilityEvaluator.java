package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.quiz.entity.DocumentKnowledgeChunkEntity;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * Interface đánh giá dung lượng và khả năng cung cấp kiến thức thực tế (Knowledge Capacity) của tài liệu.
 * Giúp tính toán số câu hỏi chất lượng tối đa có thể sinh từ tài liệu mà không gây ra tình trạng bịa đặt (Hallucination) hoặc lặp nội dung.
 */
public interface KnowledgeAvailabilityEvaluator {
    enum CapacityStatus {
        ENOUGH_KNOWLEDGE,
        INSUFFICIENT_KNOWLEDGE,
        ZERO_KNOWLEDGE
    }

    @Getter
    @Builder
    class CapacityOutcome {
        CapacityStatus status;
        int requestedQuestions;
        int usableCapacity;
        String reason;
    }

    /**
     * Tính toán dung lượng câu hỏi tối đa có thể sinh dựa trên mật độ từ và số lượng đoạn kiến thức khả thi.
     *
     * @param eligibleChunks        Danh sách các đoạn văn bản tài liệu đã qua lọc độ liên quan
     * @param requestedTotalQuestions Số lượng câu hỏi người dùng/hệ thống yêu cầu sinh
     * @return CapacityOutcome chứa kết quả đánh giá dung lượng thực tế (usableCapacity) và trạng thái đủ/thiếu kiến thức
     */
    CapacityOutcome evaluateCapacity(List<DocumentKnowledgeChunkEntity> eligibleChunks, int requestedTotalQuestions);
}
