package com.pht.dev_edu.chat.service;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.chat.entity.CourseEmbeddingEntity;
import com.pht.dev_edu.chat.repository.CourseEmbeddingRepository;
import com.pht.dev_edu.course.entity.CategoryEntity;
import com.pht.dev_edu.course.entity.CourseEntity;
import com.pht.dev_edu.course.repo.CategoryRepository;
import com.pht.dev_edu.course.repo.CourseRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseEmbeddingServiceImpl implements CourseEmbeddingService {
    CourseEmbeddingRepository courseEmbeddingRepository;
    CourseRepository courseRepository;
    CategoryRepository categoryRepository;
    OpenAiService openAiService;

    @Override
    public String stripHtmlTags(String html) {
        if (html == null || html.isBlank()) {
            return "";
        }
        return html.replaceAll("(?i)<br\\s*/?>", "\n")
                .replaceAll("(?i)</p>", "\n")
                .replaceAll("(?i)</li>", "\n")
                .replaceAll("<[^>]*>", " ")
                .replaceAll("&nbsp;", " ")
                .replaceAll("&amp;", "&")
                .replaceAll("&lt;", "<")
                .replaceAll("&gt;", ">")
                .replaceAll("&quot;", "\"")
                .replaceAll(" +", " ")
                .trim();
    }

    @Override
    public String buildSourceText(CourseEntity course) {
        StringBuilder sb = new StringBuilder();
        sb.append("Tên khoá học: ").append(course.getTitle() != null ? course.getTitle() : "").append("\n");

        if (course.getCategoryId() != null) {
            Optional<CategoryEntity> category = categoryRepository.findById(course.getCategoryId());
            category.ifPresent(cat -> sb.append("Danh mục: ").append(cat.getName()).append("\n"));
        }

        if (course.getDescription() != null) {
            String plainDesc = stripHtmlTags(course.getDescription());
            sb.append("Mô tả: ").append(plainDesc).append("\n");
        }

        if (course.getPrice() != null) {
            sb.append("Giá: ").append(course.getPrice()).append(" VND\n");
        }

        if (course.getCreatedBy() != null) {
            sb.append("Tạo bởi: ").append(course.getCreatedBy()).append("\n");
        }

        return sanitizeText(sb.toString());
    }

    @Override
    public String sanitizeText(String text) {
        if (text == null)
            return "";
        return text.replaceAll("(?i)ignore previous instructions", "")
                .replaceAll("(?i)system:", "")
                .replaceAll("(?i)you are an ai", "");
    }

    @Override
    public String computeHash(String text) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(text.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }

    @Override
    @Transactional
    public void syncEmbedding(CourseEntity course) {
        if (course.getDeletedAt() != null) {
            courseEmbeddingRepository.findByCourseId(course.getId())
                    .ifPresent(courseEmbeddingRepository::delete);
            return;
        }

        String sourceText = buildSourceText(course);
        String hash = computeHash(sourceText);

        Optional<CourseEmbeddingEntity> existingOpt = courseEmbeddingRepository.findByCourseId(course.getId());
        if (existingOpt.isPresent() && hash.equals(existingOpt.get().getContentHash())) {
            log.debug("Embedding up-to-date for course {}", course.getId());
            return;
        }

        try {
            List<Float> embeddingVector = openAiService.createEmbedding(sourceText);
            String vectorStr = formatVector(embeddingVector);

            UUID entityId = existingOpt.map(CourseEmbeddingEntity::getId).orElseGet(UuidCreator::getTimeOrderedEpoch);
            courseEmbeddingRepository.upsertEmbedding(entityId, course.getId(), hash, sourceText, vectorStr);

            log.info("Synced embedding for course {}", course.getId());
        } catch (Exception e) {
            log.error("Failed to sync embedding for course {}: {}", course.getId(), e.getMessage());
        }
    }

    @Override
    public String formatVector(List<Float> vector) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.size(); i++) {
            sb.append(vector.get(i));
            if (i < vector.size() - 1) {
                sb.append(",");
            }
        }
        sb.append("]");
        return sb.toString();
    }

    @Override
    @Transactional
    public void syncAllCourseEmbeddings() {
        try {
            log.info("Checking course embeddings sync...");
            List<CourseEntity> courses = courseRepository.findAll();
            for (CourseEntity course : courses) {
                if (course.getDeletedAt() == null) {
                    syncEmbedding(course);
                }
            }
        } catch (Exception e) {
            log.warn("Background embedding sync skipped or failed: {}", e.getMessage());
        }
    }
}
