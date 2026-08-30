package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.quiz.entity.CourseDocumentEntity;
import com.pht.dev_edu.quiz.entity.DocumentKnowledgeChunkEntity;

import java.io.InputStream;
import java.util.List;

/**
 * Service responsible for ingesting document inputs (PDF files or raw text),
 * extracting text content, performing OCR quality checks, chunking text, and generating vector embeddings.
 */
public interface DocumentProcessingService {

    /**
     * Extracts text from a document stream (PDF/Docs), splits it into knowledge chunks (~350 words),
     * computes vector embeddings, and persists them into the database.
     *
     * @param document   the {@link CourseDocumentEntity} document metadata.
     * @param fileStream the {@link InputStream} of the document file.
     * @return a list of processed and embedded {@link DocumentKnowledgeChunkEntity} records.
     */
    List<DocumentKnowledgeChunkEntity> processAndStoreDocument(
            CourseDocumentEntity document,
            InputStream fileStream
    );

    /**
     * Chunks raw text, computes vector embeddings, and persists them into the database.
     *
     * @param document the {@link CourseDocumentEntity} document metadata.
     * @param rawText  the raw text content to process.
     * @return a list of processed and embedded {@link DocumentKnowledgeChunkEntity} records.
     */
    List<DocumentKnowledgeChunkEntity> processAndStoreText(
            CourseDocumentEntity document,
            String rawText
    );
}
