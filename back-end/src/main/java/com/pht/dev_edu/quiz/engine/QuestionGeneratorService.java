package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.quiz.dto.engine.GeneratedQuestionContract;
import com.pht.dev_edu.quiz.dto.engine.QuestionSlot;

/**
 * Interface chịu trách nhiệm tương tác với Mô hình Ngôn ngữ Bất biến (LLM - OpenAI GPT)
 * để sinh nội dung câu hỏi cấu trúc (Structured JSON Output) dựa trên ngữ cảnh được cung cấp.
 */
public interface QuestionGeneratorService {

    /**
     * Gửi Prompt tới OpenAI để sinh một câu hỏi khớp với yêu cầu của QuestionSlot và ngữ cảnh nguồn.
     *
     * @param slot          Slot câu hỏi chứa chỉ tiêu loại, độ khó và chủ đề
     * @param context       Ngữ cảnh văn bản nguồn đã trích xuất
     * @param retryFeedback Lý do thất bại từ lượt trước (nếu đang ở lượt retry) để LLM tự khắc phục
     * @return GeneratedQuestionContract chứa câu hỏi, các đáp án, đáp án đúng và giải thích
     */
    GeneratedQuestionContract generateQuestion(
            QuestionSlot slot,
            KnowledgeRetrieverService.RetrievedContext context,
            String retryFeedback
    );
}
