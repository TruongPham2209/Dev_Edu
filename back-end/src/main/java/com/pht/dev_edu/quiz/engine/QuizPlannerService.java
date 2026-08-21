package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.quiz.dto.engine.QuizPlan;
import com.pht.dev_edu.quiz.entity.DocumentKnowledgeChunkEntity;

import java.util.List;
import java.util.UUID;

/**
 * Interface chịu trách nhiệm lập kế hoạch sinh câu hỏi chi tiết (Quiz Plan).
 * Tạo ra danh sách các QuestionSlot với phân bổ cụ thể về loại câu hỏi, độ khó, điểm số và gán đoạn kiến thức làm mục tiêu phủ.
 */
public interface QuizPlannerService {

    /**
     * Tạo kế hoạch sinh đề thi chỉ định danh sách các slot câu hỏi cần sinh.
     *
     * @param courseId       ID của khóa học
     * @param documentId     ID của tài liệu nguồn
     * @param requirements   Cấu hình yêu cầu đã được chuẩn hóa
     * @param usableCapacity Dung lượng câu hỏi tối đa có thể sinh
     * @param eligibleChunks Danh sách các đoạn kiến thức khả thi
     * @param targetTopic    Chủ đề mục tiêu (nếu có)
     * @return QuizPlan chứa danh sách các QuestionSlot sẵn sàng cho bước sinh nội dung
     */
    QuizPlan createPlan(
            UUID courseId,
            UUID documentId,
            QuizRequirementValidator.ValidatedRequirements requirements,
            int usableCapacity,
            List<DocumentKnowledgeChunkEntity> eligibleChunks,
            String targetTopic
    );
}
