package com.pht.dev_edu.chat.service;

import com.pht.dev_edu.course.entity.CourseEntity;

import java.util.List;

/**
 * Service for generating, synchronizing, and formatting course vector embeddings for semantic search.
 */
public interface CourseEmbeddingService {

    /**
     * Constructs a normalized source text from course title, description, and category.
     *
     * @param course the {@link CourseEntity} to extract text from.
     * @return the consolidated source text.
     */
    String buildSourceText(CourseEntity course);

    /**
     * Strips HTML tags and decodes HTML entities from a string.
     *
     * @param html the HTML string to sanitize.
     * @return the plain text string without HTML tags.
     */
    String stripHtmlTags(String html);

    /**
     * Sanitizes and normalizes whitespace in the given text.
     *
     * @param text the input text.
     * @return the cleaned text.
     */
    String sanitizeText(String text);

    /**
     * Computes the SHA-256 hash of the given text for change detection.
     *
     * @param text the input text.
     * @return the hex-encoded SHA-256 hash string.
     */
    String computeHash(String text);

    /**
     * Generates or updates the vector embedding for a specific course in the database if its content changed.
     *
     * @param course the {@link CourseEntity} to synchronize.
     */
    void syncEmbedding(CourseEntity course);

    /**
     * Formats a float vector into a pgvector-compatible PostgreSQL string representation.
     *
     * @param vector the list of float values representing the embedding vector.
     * @return the formatted vector string, e.g. "[0.123, -0.456, ...]".
     */
    String formatVector(List<Float> vector);

    /**
     * Synchronizes vector embeddings for all non-deleted courses across the system.
     */
    void syncAllCourseEmbeddings();
}
