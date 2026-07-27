package com.pht.dev_edu.course.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Executor;
import java.util.function.Supplier;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

/*
 * <analysis>
 * CategoryServiceImpl
 * - getAllCategories(ItemStatus status)
 *   - branches:
 *       status == null -> default to ACTIVE
 *       status == ALL -> categoryRepository.findAllCategories()
 *       status == ACTIVE -> categoryRepository.findAllByDeletedAtIsNull()
 *       status == DELETED -> categoryRepository.findAllByDeletedAtIsNotNull()
 *   - paths:
 *       [P1: status is null (defaults to ACTIVE)]
 *       [P2: status is ALL]
 *       [P3: status is ACTIVE]
 *       [P4: status is DELETED]
 *   - planned tests:
 *       [shouldReturnActiveCategoriesWhenStatusIsNull -> P1]
 *       [shouldReturnAllCategoriesWhenStatusIsAll -> P2]
 *       [shouldReturnActiveCategoriesWhenStatusIsActive -> P3]
 *       [shouldReturnDeletedCategoriesWhenStatusIsDeleted -> P4]
 *
 * - getCategoryById(UUID categoryId)
 *   - paths:
 *       [P1: fetches category from cache or DB via RedisUtils]
 *   - planned tests:
 *       [shouldReturnCategoryByIdFromCacheOrDb -> P1]
 *
 * - saveCategory(String author, CategoryRequest categoryReq)
 *   - branches:
 *       categoryReq.getId() != null but category not found -> DataNotFoundException
 *       category.getDeletedAt() != null -> BadRequestException
 *       isNewObjectKey == true & thumbnail has no publicUrl or not image -> BadRequestException & KafkaUtils.sendDeleteFileEvent
 *       categoryReq.getId() != null -> updates category fields & async tracking
 *       categoryReq.getId() == null -> sets createdBy & saves
 *   - paths:
 *       [P1: update non-existent category -> DataNotFoundException]
 *       [P2: update deleted category -> BadRequestException]
 *       [P3: new thumbnail invalid (no public url or not image) -> BadRequestException]
 *       [P4: update category successfully -> updates fields, invalidates cache, returns response]
 *       [P5: create new category successfully -> sets createdBy, saves, invalidates cache, returns response]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenUpdatingNonExistentCategory -> P1]
 *       [shouldThrowBadRequestWhenUpdatingDeletedCategory -> P2]
 *       [shouldThrowBadRequestWhenThumbnailIsInvalid -> P3]
 *       [shouldUpdateCategorySuccessfully -> P4]
 *       [shouldCreateNewCategorySuccessfully -> P5]
 *
 * - deleteCategory(UUID categoryId)
 *   - branches:
 *       category not found -> warn & return
 *       category deletedAt != null -> warn & return
 *       has active courses -> BadRequestException
 *       success -> sets deletedAt, saves, invalidates cache, sends tracking event
 *   - paths:
 *       [P1: category not found -> no-op]
 *       [P2: category already deleted -> no-op]
 *       [P3: category has active courses -> BadRequestException]
 *       [P4: successful deletion -> sets deletedAt & invalidates cache]
 *   - planned tests:
 *       [shouldDoNothingWhenCategoryNotFound -> P1]
 *       [shouldDoNothingWhenCategoryAlreadyDeleted -> P2]
 *       [shouldThrowBadRequestWhenCategoryHasActiveCourses -> P3]
 *       [shouldDeleteCategorySuccessfully -> P4]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for CategoryServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify business logic for category management in CategoryServiceImpl.
 *
 * Test Scope
 * ----------
 * - getAllCategories(ItemStatus)
 * - getCategoryById(UUID)
 * - saveCategory(String, CategoryRequest)
 * - deleteCategory(UUID)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Filter categories by ItemStatus (ALL, ACTIVE, DELETED, null default)
 * ✓ Retrieve category entity by ID
 * ✓ Save category validations (not found, deleted, invalid thumbnail image)
 * ✓ Create new vs update existing category
 * ✓ Delete category guard clauses (not found, already deleted, active courses restraint)
 * ✓ Successful category soft-deletion
 *
 * Mocked Dependencies
 * -------------------
 * - CourseRepository
 * - CategoryRepository
 * - FileService
 * - CategoryMapper
 * - Executor
 * - RedisUtils (static mock)
 * - KafkaUtils (static mock)
 * - TransactionUtils (static mock)
 * - SecurityContextUtils (static mock)
 */

import com.pht.dev_edu.common.dto.ItemStatus;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.common.util.TransactionUtils;
import com.pht.dev_edu.course.dto.CategoryDetailProjection;
import com.pht.dev_edu.course.dto.CategoryRequest;
import com.pht.dev_edu.course.dto.CategoryResponse;
import com.pht.dev_edu.course.entity.CategoryEntity;
import com.pht.dev_edu.course.mapper.CategoryMapper;
import com.pht.dev_edu.course.repo.CategoryRepository;
import com.pht.dev_edu.course.repo.CourseRepository;
import com.pht.dev_edu.file.dto.FileUploadResponse;
import com.pht.dev_edu.file.service.FileService;

@ExtendWith(MockitoExtension.class)
class CategoryServiceImplTest {

    @Mock
    private CourseRepository courseRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private FileService fileService;
    @Mock
    private CategoryMapper categoryMapper;
    @Mock
    private Executor executor;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    private MockedStatic<RedisUtils> redisUtilsMock;
    private MockedStatic<KafkaUtils> kafkaUtilsMock;
    private MockedStatic<TransactionUtils> transactionUtilsMock;
    private MockedStatic<SecurityContextUtils> securityContextUtilsMock;

    private static final String AUTHOR = "admin_user";
    private static final UUID CATEGORY_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        redisUtilsMock = mockStatic(RedisUtils.class);
        kafkaUtilsMock = mockStatic(KafkaUtils.class);
        transactionUtilsMock = mockStatic(TransactionUtils.class);
        securityContextUtilsMock = mockStatic(SecurityContextUtils.class);
    }

    @AfterEach
    void tearDown() {
        redisUtilsMock.close();
        kafkaUtilsMock.close();
        transactionUtilsMock.close();
        securityContextUtilsMock.close();
    }

    // ==================== getAllCategories ====================

    @Test
    @DisplayName("getAllCategories - should return active categories when status is null (defaults to ACTIVE)")
    void shouldReturnActiveCategoriesWhenStatusIsNull() {
        // Arrange
        CategoryDetailProjection projection = mock(CategoryDetailProjection.class);
        CategoryResponse response = CategoryResponse.builder().build();
        when(categoryRepository.findAllByDeletedAtIsNull()).thenReturn(List.of(projection));
        when(categoryMapper.projectionToRes(projection)).thenReturn(response);

        // Act
        List<CategoryResponse> result = categoryService.getAllCategories(null);

        // Assert
        assertThat(result).hasSize(1).contains(response);
        verify(categoryRepository).findAllByDeletedAtIsNull();
    }

    @Test
    @DisplayName("getAllCategories - should return all categories when status is ALL")
    void shouldReturnAllCategoriesWhenStatusIsAll() {
        // Arrange
        CategoryDetailProjection projection = mock(CategoryDetailProjection.class);
        CategoryResponse response = CategoryResponse.builder().build();
        when(categoryRepository.findAllCategories()).thenReturn(List.of(projection));
        when(categoryMapper.projectionToRes(projection)).thenReturn(response);

        // Act
        List<CategoryResponse> result = categoryService.getAllCategories(ItemStatus.ALL);

        // Assert
        assertThat(result).hasSize(1).contains(response);
        verify(categoryRepository).findAllCategories();
    }

    @Test
    @DisplayName("getAllCategories - should return active categories when status is ACTIVE")
    void shouldReturnActiveCategoriesWhenStatusIsActive() {
        // Arrange
        CategoryDetailProjection projection = mock(CategoryDetailProjection.class);
        CategoryResponse response = CategoryResponse.builder().build();
        when(categoryRepository.findAllByDeletedAtIsNull()).thenReturn(List.of(projection));
        when(categoryMapper.projectionToRes(projection)).thenReturn(response);

        // Act
        List<CategoryResponse> result = categoryService.getAllCategories(ItemStatus.ACTIVE);

        // Assert
        assertThat(result).hasSize(1).contains(response);
        verify(categoryRepository).findAllByDeletedAtIsNull();
    }

    @Test
    @DisplayName("getAllCategories - should return deleted categories when status is DELETED")
    void shouldReturnDeletedCategoriesWhenStatusIsDeleted() {
        // Arrange
        CategoryDetailProjection projection = mock(CategoryDetailProjection.class);
        CategoryResponse response = CategoryResponse.builder().build();
        when(categoryRepository.findAllByDeletedAtIsNotNull()).thenReturn(List.of(projection));
        when(categoryMapper.projectionToRes(projection)).thenReturn(response);

        // Act
        List<CategoryResponse> result = categoryService.getAllCategories(ItemStatus.DELETED);

        // Assert
        assertThat(result).hasSize(1).contains(response);
        verify(categoryRepository).findAllByDeletedAtIsNotNull();
    }

    // ==================== getCategoryById ====================

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("getCategoryById - should return category entity from cache or DB")
    void shouldReturnCategoryByIdFromCacheOrDb() {
        // Arrange
        CategoryEntity entity = CategoryEntity.builder().id(CATEGORY_ID).name("Java").build();
        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(CategoryEntity.class), any(Supplier.class), any())).thenReturn(entity);

        // Act
        CategoryEntity result = categoryService.getCategoryById(CATEGORY_ID);

        // Assert
        assertThat(result).isEqualTo(entity);
    }

    // ==================== saveCategory ====================

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("saveCategory - should throw DataNotFoundException when updating non-existent category")
    void shouldThrowDataNotFoundWhenUpdatingNonExistentCategory() {
        // Arrange
        CategoryRequest request = new CategoryRequest();
        request.setId(CATEGORY_ID);

        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(CategoryEntity.class), any(Supplier.class), any())).thenReturn(null);

        // Act & Assert
        assertThatThrownBy(() -> categoryService.saveCategory(AUTHOR, request))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Category not found.");
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("saveCategory - should throw BadRequestException when updating deleted category")
    void shouldThrowBadRequestWhenUpdatingDeletedCategory() {
        // Arrange
        CategoryRequest request = new CategoryRequest();
        request.setId(CATEGORY_ID);

        CategoryEntity deletedCategory = CategoryEntity.builder()
                .id(CATEGORY_ID)
                .deletedAt(LocalDateTime.now())
                .build();

        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(CategoryEntity.class), any(Supplier.class), any()))
                .thenReturn(deletedCategory);

        // Act & Assert
        assertThatThrownBy(() -> categoryService.saveCategory(AUTHOR, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Category not found.");
    }

    @Test
    @DisplayName("saveCategory - should throw BadRequestException when thumbnail is not accessible or not image")
    void shouldThrowBadRequestWhenThumbnailIsInvalid() {
        // Arrange
        CategoryRequest request = new CategoryRequest();
        request.setThumbnailObjectKey("pub-bucket/thumb.txt"); // Not image or no public URL

        CategoryEntity newEntity = CategoryEntity.builder().build();
        when(categoryMapper.reqToEntity(request)).thenReturn(newEntity);

        FileUploadResponse fileInfo = FileUploadResponse.builder()
                .contentType("text/plain") // Non-image content type
                .publicUrl(null)
                .build();
        when(fileService.getFileInfo(AUTHOR, "pub-bucket/thumb.txt")).thenReturn(fileInfo);

        // Act & Assert
        assertThatThrownBy(() -> categoryService.saveCategory(AUTHOR, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Thumbnail is not accessible.");

        kafkaUtilsMock.verify(() -> KafkaUtils.sendDeleteFileEvent("pub-bucket/thumb.txt"));
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("saveCategory - should update category successfully")
    void shouldUpdateCategorySuccessfully() {
        // Arrange
        CategoryRequest request = new CategoryRequest();
        request.setId(CATEGORY_ID);
        request.setName("Updated Java");
        request.setDescription("Updated Desc");
        request.setThumbnailObjectKey("pub-bucket/old-thumb.png"); // Same thumbnail

        CategoryEntity existingCategory = CategoryEntity.builder()
                .id(CATEGORY_ID)
                .name("Java")
                .thumbnailObjectKey("pub-bucket/old-thumb.png")
                .thumbnailUrl("https://pub-url/old-thumb.png")
                .build();

        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(CategoryEntity.class), any(Supplier.class), any()))
                .thenReturn(existingCategory);

        CategoryResponse response = CategoryResponse.builder().build();
        when(categoryMapper.entityToRes(existingCategory)).thenReturn(response);

        // Act
        CategoryResponse result = categoryService.saveCategory(AUTHOR, request);

        // Assert
        assertThat(result).isEqualTo(response);
        verify(categoryRepository).save(existingCategory);
        redisUtilsMock.verify(() -> RedisUtils.invalidateCache(anyString()));
    }

    @Test
    @DisplayName("saveCategory - should create new category successfully")
    void shouldCreateNewCategorySuccessfully() {
        // Arrange
        CategoryRequest request = new CategoryRequest();
        request.setName("New Category");
        request.setThumbnailObjectKey("pub-bucket/new-thumb.png");

        CategoryEntity newEntity = CategoryEntity.builder()
                .id(CATEGORY_ID)
                .name("New Category")
                .thumbnailObjectKey("pub-bucket/new-thumb.png")
                .build();
        when(categoryMapper.reqToEntity(request)).thenReturn(newEntity);

        FileUploadResponse fileInfo = FileUploadResponse.builder()
                .contentType("image/png")
                .publicUrl("https://pub-url/new-thumb.png")
                .build();
        when(fileService.getFileInfo(AUTHOR, "pub-bucket/new-thumb.png")).thenReturn(fileInfo);

        CategoryResponse response = CategoryResponse.builder().build();
        when(categoryMapper.entityToRes(newEntity)).thenReturn(response);

        // Act
        CategoryResponse result = categoryService.saveCategory(AUTHOR, request);

        // Assert
        assertThat(result).isEqualTo(response);
        verify(categoryRepository).save(newEntity);
        assertThat(newEntity.getCreatedBy()).isEqualTo(AUTHOR);
        assertThat(newEntity.getThumbnailUrl()).isEqualTo("https://pub-url/new-thumb.png");
        redisUtilsMock.verify(() -> RedisUtils.invalidateCache(anyString()));
    }

    // ==================== deleteCategory ====================

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("deleteCategory - should do nothing when category not found")
    void shouldDoNothingWhenCategoryNotFound() {
        // Arrange
        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(CategoryEntity.class), any(Supplier.class), any())).thenReturn(null);

        // Act
        categoryService.deleteCategory(CATEGORY_ID);

        // Verify
        verify(categoryRepository, never()).save(any());
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("deleteCategory - should do nothing when category is already deleted")
    void shouldDoNothingWhenCategoryAlreadyDeleted() {
        // Arrange
        CategoryEntity deletedCategory = CategoryEntity.builder()
                .id(CATEGORY_ID)
                .deletedAt(LocalDateTime.now())
                .build();

        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(CategoryEntity.class), any(Supplier.class), any()))
                .thenReturn(deletedCategory);

        // Act
        categoryService.deleteCategory(CATEGORY_ID);

        // Verify
        verify(categoryRepository, never()).save(any());
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("deleteCategory - should throw BadRequestException when category has active courses")
    void shouldThrowBadRequestWhenCategoryHasActiveCourses() {
        // Arrange
        CategoryEntity activeCategory = CategoryEntity.builder().id(CATEGORY_ID).build();

        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(CategoryEntity.class), any(Supplier.class), any()))
                .thenReturn(activeCategory);

        when(courseRepository.existsByCategoryIdAndDeletedAtIsNull(CATEGORY_ID)).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> categoryService.deleteCategory(CATEGORY_ID))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot delete category because it has active courses.");
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("deleteCategory - should soft delete category successfully")
    void shouldDeleteCategorySuccessfully() {
        // Arrange
        CategoryEntity activeCategory = CategoryEntity.builder().id(CATEGORY_ID).build();

        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(CategoryEntity.class), any(Supplier.class), any()))
                .thenReturn(activeCategory);

        when(courseRepository.existsByCategoryIdAndDeletedAtIsNull(CATEGORY_ID)).thenReturn(false);
        securityContextUtilsMock.when(SecurityContextUtils::getCurrentUsername).thenReturn(AUTHOR);

        // Act
        categoryService.deleteCategory(CATEGORY_ID);

        // Assert & Verify
        assertThat(activeCategory.getDeletedAt()).isNotNull();
        verify(categoryRepository).save(activeCategory);
        redisUtilsMock.verify(() -> RedisUtils.invalidateCache(anyString()));
    }
}
