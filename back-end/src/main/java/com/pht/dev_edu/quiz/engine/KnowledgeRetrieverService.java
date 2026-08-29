package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.quiz.dto.engine.QuestionSlot;
import com.pht.dev_edu.quiz.entity.DocumentKnowledgeChunkEntity;

import java.util.List;

/**
 * Interface trích xuất ngữ cảnh kiến thức mục tiêu (Knowledge Retrieval) phục vụ trực tiếp cho từng slot câu hỏi.
 * Cung cấp văn bản nguồn cùng các thông tin trích dẫn (chương, trang, tài liệu) cho LLM prompt.
 */
public interface KnowledgeRetrieverService {

    /**
     * Chứa kết quả trích xuất ngữ cảnh nguồn bao gồm nội dung văn bản và các chunk liên quan.
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
     * Trích xuất ngữ cảnh kiến thức phù hợp cho một QuestionSlot dựa trên danh sách các chunk hợp lệ.
     *
     * @param slot                Slot câu hỏi đang xử lý
     * @param allEligibleChunks   Tất cả các đoạn kiến thức hợp lệ của tài liệu
     * @return RetrievedContext chứa chuỗi ngữ cảnh văn bản nguồn và bản ghi chunk được chọn
     */
    RetrievedContext retrieveContextForSlot(QuestionSlot slot, List<DocumentKnowledgeChunkEntity> allEligibleChunks);
}
