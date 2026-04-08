package com.pht.dev_edu.course.service;

import com.pht.dev_edu.common.constant.EventTrackingConstant;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.common.constant.RedisDurationConstant;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.dto.ItemStatus;
import com.pht.dev_edu.common.dto.TrackingEvent;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.RedisUtil;
import com.pht.dev_edu.common.util.SecurityContextUtil;
import com.pht.dev_edu.course.dto.CategoryRequest;
import com.pht.dev_edu.course.dto.CategoryResponse;
import com.pht.dev_edu.course.entity.CategoryEntity;
import com.pht.dev_edu.course.repo.CategoryRepository;
import com.pht.dev_edu.file.dto.FileDeleteEvent;
import com.pht.dev_edu.file.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class CategoryServiceImpl implements CategoryService {
    CategoryRepository categoryRepository;

    FileService fileService;

    KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public List<CategoryResponse> getAllCategories(ItemStatus status) {
        var categories = switch (status) {
            case ALL -> categoryRepository.findAll();
            case ACTIVE -> categoryRepository.findAllByDeletedAtIsNull();
            case DELETED -> categoryRepository.findAllByDeletedAtIsNotNull();
        };
        return null;
    }

    @Override
    public CategoryEntity getCategoryById(UUID categoryId) {
        return RedisUtil.getDataFromCacheOrDb(
                RedisPrefixConstant.CATEGORY_PREFIX + categoryId,
                CategoryEntity.class,
                () -> categoryRepository.findById(categoryId),
                RedisDurationConstant.CATEGORY_DATA_DURATION
        );
    }

    @Override
    @Transactional
    public CategoryResponse saveCategory(String author, CategoryRequest categoryReq) {
        var category = author == null ? getCategoryById(categoryReq.getId()) : null;
        if (category == null) {
            log.error("Category with id {} not found for update", categoryReq.getId());
            throw new DataNotFoundException("Category not found.");
        }

        if (category.getDeletedAt() != null) {
            log.error("Category with id {} is deleted and cannot be updated", categoryReq.getId());
            throw new BadRequestException("Category not found.");
        }

        var thumbnailInfo = fileService.getFileInfo(author, categoryReq.getThumbnailObjectKey());
        if (!StringUtils.hasText(thumbnailInfo.getPublicUrl())) {
            var deleteFileEvent = FileDeleteEvent.builder()
                    .fullObjectKey(categoryReq.getThumbnailObjectKey())
                    .build();
            kafkaTemplate.send(KafkaTopicConstant.FILE_DELETE_TOPIC, deleteFileEvent);

            log.error("Thumbnail with object key {} does not have a public URL", categoryReq.getThumbnailObjectKey());
            throw new BadRequestException("Thumbnail is not accessible.");
        }

        // Update entity
        if (categoryReq.getId() != null) {
            // Convert to entity
            category.setId(categoryReq.getId());
//            category.setCreatedBy();

            var tracking = TrackingEvent.builder()
                    .username(author)
                    .aggregateId(category.getId())
                    .action(EventTrackingConstant.CATEGORY_UPDATED)
                    .details("Category updated with id: " + category.getId())
                    .build();
            kafkaTemplate.send(KafkaTopicConstant.TRACKING_EVENT_TOPIC, tracking);
        }
        category.setThumbnailUrl(thumbnailInfo.getPublicUrl());
        categoryRepository.save(category);

        return null;
    }

    @Override
    @Transactional
    public void deleteCategory(UUID categoryId) {
        var category = getCategoryById(categoryId);
        if (category == null) {
            log.warn("Category with id {} not found for deletion", categoryId);
            return;
        }

        if (category.getDeletedAt() != null) {
            log.warn("Category with id {} is already deleted", categoryId);
            return;
        }

        var tracking = TrackingEvent.builder()
                .username(SecurityContextUtil.getCurrentUsername())
                .aggregateId(category.getId())
                .action(EventTrackingConstant.CATEGORY_DELETED)
                .details("Category deleted with id: " + category.getId())
                .build();
        kafkaTemplate.send(KafkaTopicConstant.TRACKING_EVENT_TOPIC, tracking);

        category.setDeletedAt(java.time.LocalDateTime.now());
        categoryRepository.save(category);
        RedisUtil.invalidateCache(RedisPrefixConstant.CATEGORY_PREFIX + categoryId);
    }
}
