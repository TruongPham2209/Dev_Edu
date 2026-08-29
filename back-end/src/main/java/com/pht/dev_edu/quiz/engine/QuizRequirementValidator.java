package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.quiz.dto.enums.QuestionDifficulty;
import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import com.pht.dev_edu.quiz.dto.request.GenerateQuizFromDocumentRequest;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;

/**
 * Interface chịu trách nhiệm kiểm tra tính hợp lệ (Validation) và chuẩn hóa (Normalization)
 * các thông số yêu cầu sinh Quiz từ request đầu vào (tổng số câu hỏi, phân bổ loại câu hỏi và phân bổ độ khó).
 */
public interface QuizRequirementValidator {
    @Getter
    @Builder
    class ValidatedRequirements {
        int totalQuestions;
        Map<QuestionType, Integer> typeDistribution;
        Map<QuestionDifficulty, Integer> difficultyDistribution;
    }

    /**
     * Kiểm tra ràng buộc dữ liệu đầu vào và chuẩn hóa phân bổ loại câu hỏi / độ khó theo tỷ lệ mặc định nếu thiếu.
     *
     * @param request Dữ liệu yêu cầu sinh Quiz từ API
     * @return ValidatedRequirements chứa các chỉ tiêu số lượng đã chuẩn hóa an toàn
     */
    ValidatedRequirements validateAndNormalize(GenerateQuizFromDocumentRequest request);
}
