package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.quiz.dto.engine.GeneratedQuestionContract;
import com.pht.dev_edu.quiz.dto.enums.ValidationFailureReason;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

/**
 * Interface kiểm định chất lượng đa tầng (Multi-Stage Quality Validation Pipeline).
 * Thực thi các lớp kiểm tra: Schema hợp lệ, tính mơ hồ của đáp án, bằng chứng thực tế từ tài liệu nguồn (Grounding Evidence),
 * và chống trùng lặp ngữ nghĩa (Duplicate Check) với các câu đã sinh và CSDL hiện có.
 */
public interface QuestionValidationPipeline {
    @Getter
    @Builder
    class ValidationResult {
        boolean isPassed;
        ValidationFailureReason failureReason;
        String message;
    }

    /**
     * Kiểm định toàn bộ các tiêu chí chất lượng đối với một câu hỏi vừa sinh ra.
     *
     * @param question             Dữ liệu hợp đồng câu hỏi vừa sinh từ LLM
     * @param sourceContextText    Văn bản nguồn dùng để kiểm tra tính thực tế (Grounding)
     * @param acceptedJobQuestions Danh sách các câu hỏi đã được chấp nhận trong Job hiện tại (chống trùng lặp nội bộ)
     * @param courseId             ID khóa học để kiểm tra chống trùng lặp với Ngân hàng câu hỏi trong CSDL
     * @return ValidationResult chứa trạng thái Đạt/Không đạt và lý do thất bại chi tiết (nếu có)
     */
    ValidationResult validateQuestion(
            GeneratedQuestionContract question,
            String sourceContextText,
            List<GeneratedQuestionContract> acceptedJobQuestions,
            UUID courseId
    );
}
