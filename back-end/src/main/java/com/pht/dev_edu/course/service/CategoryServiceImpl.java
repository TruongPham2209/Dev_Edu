package com.pht.dev_edu.course.service;

import com.pht.dev_edu.common.constant.EventTrackingConstant;
import com.pht.dev_edu.common.constant.RedisDurationConstant;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.dto.ItemStatus;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.*;
import com.pht.dev_edu.course.dto.CategoryRequest;
import com.pht.dev_edu.course.dto.CategoryResponse;
import com.pht.dev_edu.course.entity.CategoryEntity;
import com.pht.dev_edu.course.mapper.CategoryMapper;
import com.pht.dev_edu.course.repo.CategoryRepository;
import com.pht.dev_edu.course.repo.CourseRepository;
import com.pht.dev_edu.file.service.FileService;
import com.pht.dev_edu.tracking.dto.TrackingEvent;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.Executor;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class CategoryServiceImpl implements CategoryService {
    CourseRepository courseRepository;
    CategoryRepository categoryRepository;

    FileService fileService;
    CategoryMapper categoryMapper;
    Executor executor;

    @Override
    public List<CategoryResponse> getAllCategories(ItemStatus status) {
        if (status == null) {
            status = ItemStatus.ACTIVE;
        }

        var categories = switch (status) {
            case ALL -> categoryRepository.findAllCategories();
            case ACTIVE -> categoryRepository.findAllByDeletedAtIsNull();
            case DELETED -> categoryRepository.findAllByDeletedAtIsNotNull();
        };
        return categories.stream()
                .map(categoryMapper::projectionToRes)
                .toList();
    }

    @Override
    public CategoryEntity getCategoryById(UUID categoryId) {
        return RedisUtils.getOptionalDataFromCacheOrDb(
                RedisPrefixConstant.CATEGORY_PREFIX + categoryId,
                CategoryEntity.class,
                () -> categoryRepository.findById(categoryId),
                RedisDurationConstant.CATEGORY_DATA_DURATION
        );
    }

    @Override
    @Transactional
    public CategoryResponse saveCategory(String author, CategoryRequest categoryReq) {
        var category = categoryReq.getId() != null ? getCategoryById(categoryReq.getId()) : categoryMapper.reqToEntity(categoryReq);
        if (category == null) {
            log.error("Category with id {} not found for update", categoryReq.getId());
            throw new DataNotFoundException("Category not found.");
        }

        if (category.getDeletedAt() != null) {
            log.error("Category with id {} is deleted and cannot be updated", categoryReq.getId());
            throw new BadRequestException("Category not found.");
        }

        boolean isNewObjectKey = categoryReq.getId() == null || !categoryReq.getThumbnailObjectKey().equals(category.getThumbnailObjectKey());
        String thumbnailObjectKey = isNewObjectKey ? categoryReq.getThumbnailObjectKey() : category.getThumbnailObjectKey();
        String thumbnailUrl = category.getThumbnailUrl();

        if (isNewObjectKey) {
            var thumbnailInfo = fileService.getFileInfo(author, categoryReq.getThumbnailObjectKey());
            boolean isImage = FileContentTypeUtils.isValidContentType(thumbnailInfo.getContentType(), FileContentTypeUtils.FileType.IMAGE);
            if (!StringUtils.hasText(thumbnailInfo.getPublicUrl()) || !isImage) {
                KafkaUtils.sendDeleteFileEvent(categoryReq.getThumbnailObjectKey());

                log.error("Thumbnail with object key {} does not have a public URL", categoryReq.getThumbnailObjectKey());
                throw new BadRequestException("Thumbnail is not accessible.");
            }

            thumbnailUrl = thumbnailInfo.getPublicUrl();
        }

        // Update entity
        if (categoryReq.getId() != null) {
            category.setName(categoryReq.getName());
            category.setDescription(categoryReq.getDescription());
            category.setThumbnailObjectKey(thumbnailObjectKey);
            category.setThumbnailUrl(thumbnailUrl);

            TransactionUtils.runAfterCommitAsync(() -> {
                var tracking = TrackingEvent.builder()
                        .username(author)
                        .aggregateId(category.getId())
                        .action(EventTrackingConstant.CATEGORY_UPDATED)
                        .details("Category updated with id: " + category.getId())
                        .build();
                KafkaUtils.sendTrackingEvent(tracking);
            }, executor);
        } else {
            category.setCreatedBy(author);
        }
        category.setThumbnailUrl(thumbnailUrl);
        categoryRepository.save(category);

        RedisUtils.invalidateCache(RedisPrefixConstant.CATEGORY_PREFIX + category.getId());
        return categoryMapper.entityToRes(category);
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

        if (courseRepository.existsByCategoryIdAndDeletedAtIsNull(categoryId)) {
            log.error("Cannot delete category with id {} because it has active courses", categoryId);
            throw new BadRequestException("Cannot delete category because it has active courses.");
        }

        TransactionUtils.runAfterCommitAsync(() -> {
            var tracking = TrackingEvent.builder()
                    .username(SecurityContextUtils.getCurrentUsername())
                    .aggregateId(category.getId())
                    .action(EventTrackingConstant.CATEGORY_DELETED)
                    .details("Category deleted with id: " + category.getId())
                    .build();
            KafkaUtils.sendTrackingEvent(tracking);
        }, executor);

        category.setDeletedAt(java.time.LocalDateTime.now());
        categoryRepository.save(category);
        RedisUtils.invalidateCache(RedisPrefixConstant.CATEGORY_PREFIX + categoryId);
    }
}
