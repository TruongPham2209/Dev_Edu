package com.pht.dev_edu.chat.service;

import com.pht.dev_edu.course.entity.CourseEntity;

import java.util.List;

public interface CourseEmbeddingService {
    String buildSourceText(CourseEntity course);

    String stripHtmlTags(String html);

    String sanitizeText(String text);

    String computeHash(String text);

    void syncEmbedding(CourseEntity course);

    String formatVector(List<Float> vector);

    void syncAllCourseEmbeddings();
}
