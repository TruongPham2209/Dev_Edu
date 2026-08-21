package com.pht.dev_edu.quiz.service;

import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.quiz.dto.enums.DocumentStatus;
import com.pht.dev_edu.quiz.dto.enums.DocumentVisibility;
import com.pht.dev_edu.quiz.dto.response.CourseDocumentResponse;
import com.pht.dev_edu.quiz.entity.CourseDocumentEntity;
import com.pht.dev_edu.quiz.repo.CourseDocumentRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.TimeStampCursor;
import com.pht.dev_edu.common.util.PagingUtils;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseDocumentServiceImpl implements CourseDocumentService {
    CourseDocumentRepository documentRepository;

    private static final int DEFAULT_LIBRARY_PAGE_SIZE = 15;

    @Override
    public CustomPaging<CourseDocumentResponse> getGlobalDocumentLibrary(String nextCursor, String fileName) {
        TimeStampCursor cursor = resolveCursor(nextCursor);
        String searchFileName = StringUtils.hasText(fileName) ? fileName.trim() : null;

        List<CourseDocumentEntity> docs = documentRepository.findGlobalDocumentsWithCursor(
                searchFileName,
                cursor.getTimeStamp(),
                cursor.getId(),
                DEFAULT_LIBRARY_PAGE_SIZE + 1
        );

        return PagingUtils.getPagedWithCursor(
                docs,
                this::mapToResponse,
                CourseDocumentEntity::getCreatedAt,
                CourseDocumentEntity::getId,
                DEFAULT_LIBRARY_PAGE_SIZE
        );
    }

    private TimeStampCursor resolveCursor(String nextCursor) {
        return StringUtils.hasText(nextCursor)
                ? PagingUtils.decodeTimeStampCursor(nextCursor)
                : TimeStampCursor.getDefaultCursor(true);
    }

    @Override
    @Transactional
    public CourseDocumentResponse uploadGlobalDocumentByAdmin(MultipartFile file, String title, String username) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty.");
        }

        String filename = file.getOriginalFilename();
        if (filename != null && !filename.toLowerCase().endsWith(".pdf")) {
            throw new BadRequestException("Only PDF document files are allowed in Global Document Library.");
        }

        try {
            byte[] bytes = file.getBytes();
            String hash = computeSha256(bytes);
            String docTitle = title != null && !title.isBlank() ? title : filename;
            String objectKey = "documents/global/" + System.currentTimeMillis() + "-" + filename;

            CourseDocumentEntity doc = CourseDocumentEntity.builder()
                    .title(docTitle)
                    .fileName(filename)
                    .fileObjectKey(objectKey)
                    .fileSize(file.getSize())
                    .contentHash(hash)
                    .status(DocumentStatus.READY)
                    .visibility(DocumentVisibility.GLOBAL)
                    .isPromoted(false)
                    .createdBy(username)
                    .build();

            CourseDocumentEntity savedDoc = documentRepository.save(doc);
            log.info("Admin {} uploaded global document {} (id={})", username, filename, savedDoc.getId());
            return mapToResponse(savedDoc);
        } catch (Exception e) {
            log.error("Failed to upload global document by admin", e);
            throw new BadRequestException("Failed to upload document: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void deleteGlobalDocument(UUID documentId, String username) {
        CourseDocumentEntity doc = documentRepository.findByIdAndDeletedAtIsNull(documentId)
                .orElseThrow(() -> new DataNotFoundException("Global document not found: " + documentId));

        doc.setDeletedAt(LocalDateTime.now());
        documentRepository.save(doc);
        log.info("Admin {} deleted global document {}", username, documentId);
    }

    private CourseDocumentResponse mapToResponse(CourseDocumentEntity entity) {
        return CourseDocumentResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .fileName(entity.getFileName())
                .fileObjectKey(entity.getFileObjectKey())
                .fileSize(entity.getFileSize())
                .contentHash(entity.getContentHash())
                .status(entity.getStatus())
                .visibility(entity.getVisibility())
                .isPromoted(entity.getIsPromoted())
                .createdBy(entity.getCreatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private String computeSha256(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data);
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1)
                    hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return String.valueOf(data.hashCode());
        }
    }
}
