package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.quiz.entity.CourseDocumentEntity;
import com.pht.dev_edu.quiz.entity.DocumentKnowledgeChunkEntity;

import java.io.InputStream;
import java.util.List;

/**
 * Interface chịu trách nhiệm tiếp nhận tài liệu đầu vào (file PDF hoặc văn bản thô),
 * thực hiện trích xuất nội dung, kiểm tra chất lượng ký tự (OCR Quality Check),
 * phân đoạn kiến thức (Chunking) và tạo Vector Embeddings lưu trữ trong CSDL.
 */
public interface DocumentProcessingService {

    /**
     * Trích xuất văn bản từ luồng dữ liệu file (PDF/Docs), chia nhỏ thành các đoạn kiến thức (~350 từ),
     * tính toán Vector Embedding và lưu vào CSDL (bảng document_knowledge_chunks liên kết theo document_id).
     *
     * @param document   Thực thể CourseDocumentEntity chứa thông tin tài liệu
     * @param fileStream Luồng byte đọc file tài liệu
     * @return Danh sách các bản ghi DocumentKnowledgeChunkEntity đã được tạo vector embedding
     */
    List<DocumentKnowledgeChunkEntity> processAndStoreDocument(
            CourseDocumentEntity document,
            InputStream fileStream
    );

    /**
     * Phân đoạn văn bản thô (raw text), tính toán Vector Embedding và lưu vào CSDL.
     *
     * @param document Thực thể CourseDocumentEntity chứa thông tin tài liệu
     * @param rawText  Nội dung văn bản thô cần xử lý
     * @return Danh sách các bản ghi DocumentKnowledgeChunkEntity đã được lưu
     */
    List<DocumentKnowledgeChunkEntity> processAndStoreText(
            CourseDocumentEntity document,
            String rawText
    );
}
