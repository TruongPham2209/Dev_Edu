package com.pht.dev_edu.file.service;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.exception.server.ServerInternalException;
import com.pht.dev_edu.file.config.FileMultipartProperties;
import com.pht.dev_edu.file.dto.*;
import com.pht.dev_edu.file.entity.FileUploadEntity;
import com.pht.dev_edu.file.repo.FileUploadRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedUploadPartRequest;
import software.amazon.awssdk.services.s3.presigner.model.UploadPartPresignRequest;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileMultipartServiceImpl implements FileMultipartService {

    FileUploadRepository fileUploadRepository;
    S3Presigner s3Presigner;
    S3Client s3Client;
    FileMultipartSessionStore sessionStore;
    FileMultipartProperties multipartProperties;

    @NonFinal
    @Value("${cloudflare.r2.public-bucket-name}")
    String publicBucketName;

    @NonFinal
    @Value("${cloudflare.r2.private-bucket-name}")
    String privateBucketName;

    @NonFinal
    @Value("${cloudflare.r2.public-url}")
    String publicUrl;

    private static final int MAX_S3_PARTS = 10000;

    @Override
    @Transactional
    public MultipartUploadInitResponse initMultipartUpload(MultipartUploadInitRequest request) {
        validateInitRequest(request);

        boolean isPublic = Boolean.TRUE.equals(request.getIsPublic());
        String bucketName = isPublic ? publicBucketName : privateBucketName;
        String objectKey = generateObjectKey(request.getFileName());
        String fullObjectKey = bucketName + "/" + objectKey;

        long chunkSize = multipartProperties.getChunkSize();
        int totalParts = calculateTotalParts(request.getFileSize(), chunkSize);

        // Adjust chunkSize if file size exceeds MAX_S3_PARTS with default chunk size
        if (totalParts > MAX_S3_PARTS) {
            chunkSize = (long) Math.ceil((double) request.getFileSize() / MAX_S3_PARTS);
            totalParts = MAX_S3_PARTS;
        }

        String uploadId;
        try {
            CreateMultipartUploadRequest createRequest = CreateMultipartUploadRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .contentType(request.getContentType())
                    .build();

            CreateMultipartUploadResponse response = s3Client.createMultipartUpload(createRequest);
            uploadId = response.uploadId();
        } catch (Exception e) {
            log.error("Failed to create multipart upload on S3/R2 for key: {}", fullObjectKey, e);
            throw new ServerInternalException("Failed to initiate multipart upload: " + e.getMessage());
        }

        UUID sessionUuid = UuidCreator.getTimeOrderedEpoch();
        String sessionId = sessionUuid.toString();
        LocalDateTime expiresAt = LocalDateTime.now().plus(multipartProperties.getSessionExpiration());

        // Track in database without modifying schema
        FileUploadEntity fileUpload = FileUploadEntity.builder()
                .id(sessionUuid)
                .objectKey(fullObjectKey)
                .fileName(request.getFileName())
                .contentType(request.getContentType())
                .status(UploadStatus.PENDING)
                .fileSize(request.getFileSize())
                .createdBy(request.getUsername())
                .expiredAt(expiresAt)
                .build();
        fileUploadRepository.save(fileUpload);

        // Track control-plane session in Redis
        MultipartUploadSession session = MultipartUploadSession.builder()
                .sessionId(sessionId)
                .uploadId(uploadId)
                .objectKey(objectKey)
                .fullObjectKey(fullObjectKey)
                .bucketName(bucketName)
                .fileName(request.getFileName())
                .contentType(request.getContentType())
                .fileSize(request.getFileSize())
                .chunkSize(chunkSize)
                .totalParts(totalParts)
                .username(request.getUsername())
                .isPublic(isPublic)
                .createdAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .status(UploadStatus.PENDING)
                .build();
        sessionStore.save(session, multipartProperties.getSessionExpiration());

        String publicUrlStr = isPublic ? resolvePublicUrl(objectKey) : null;

        return MultipartUploadInitResponse.builder()
                .sessionId(sessionId)
                .chunkSize(chunkSize)
                .totalParts(totalParts)
                .windowSize(multipartProperties.getPresignWindowSize())
                .concurrency(multipartProperties.getUploadConcurrency())
                .objectKey(fullObjectKey)
                .publicUrl(publicUrlStr)
                .build();
    }

    @Override
    public MultipartUploadPresignResponse presignMultipartParts(String sessionId, MultipartUploadPresignRequest request, String username) {
        MultipartUploadSession session = findAndValidateActiveSession(sessionId, username);

        int fromPart = request.getFromPart();
        if (fromPart < 1 || fromPart > session.getTotalParts()) {
            throw new BadRequestException(String.format("Invalid fromPart: %d. Total parts are %d", fromPart, session.getTotalParts()));
        }

        int windowSize = multipartProperties.getPresignWindowSize();
        if (request.getPartCount() != null && request.getPartCount() > 0) {
            windowSize = Math.min(windowSize, request.getPartCount());
        }

        int toPart = Math.min(session.getTotalParts(), fromPart + windowSize - 1);
        Duration presignDuration = multipartProperties.getPresignExpiration();
        LocalDateTime partExpiresAt = LocalDateTime.now().plus(presignDuration);

        List<PresignedPartDto> presignedParts = new ArrayList<>();
        for (int partNumber = fromPart; partNumber <= toPart; partNumber++) {
            UploadPartRequest uploadPartRequest = UploadPartRequest.builder()
                    .bucket(session.getBucketName())
                    .key(session.getObjectKey())
                    .uploadId(session.getUploadId())
                    .partNumber(partNumber)
                    .build();

            UploadPartPresignRequest presignRequest = UploadPartPresignRequest.builder()
                    .signatureDuration(presignDuration)
                    .uploadPartRequest(uploadPartRequest)
                    .build();

            PresignedUploadPartRequest presigned = s3Presigner.presignUploadPart(presignRequest);

            presignedParts.add(PresignedPartDto.builder()
                    .partNumber(partNumber)
                    .presignedUrl(presigned.url().toString())
                    .expiresAt(partExpiresAt)
                    .build());
        }

        return MultipartUploadPresignResponse.builder()
                .sessionId(sessionId)
                .parts(presignedParts)
                .build();
    }

    @Override
    @Transactional
    public FileUploadResponse completeMultipartUpload(String sessionId, MultipartUploadCompleteRequest request, String username) {
        MultipartUploadSession session = findAndValidateSessionForComplete(sessionId, username);

        if (session.getStatus() == UploadStatus.COMPLETED) {
            return buildCompletedFileUploadResponse(session);
        }

        validateCompleteParts(request, session.getTotalParts());

        List<CompletedPart> completedParts = request.getParts().stream()
                .sorted(Comparator.comparingInt(MultipartUploadPartDto::getPartNumber))
                .map(part -> CompletedPart.builder()
                        .partNumber(part.getPartNumber())
                        .eTag(cleanETag(part.getETag()))
                        .build())
                .toList();

        CompletedMultipartUpload completedMultipartUpload = CompletedMultipartUpload.builder()
                .parts(completedParts)
                .build();

        CompleteMultipartUploadRequest completeRequest = CompleteMultipartUploadRequest.builder()
                .bucket(session.getBucketName())
                .key(session.getObjectKey())
                .uploadId(session.getUploadId())
                .multipartUpload(completedMultipartUpload)
                .build();

        try {
            s3Client.completeMultipartUpload(completeRequest);
        } catch (Exception e) {
            log.error("Failed to complete multipart upload on S3/R2: sessionId={}, uploadId={}", sessionId, session.getUploadId(), e);
            throw new ServerInternalException("Failed to complete multipart upload: " + e.getMessage());
        }

        fileUploadRepository.findByObjectKey(session.getFullObjectKey()).ifPresent(entity -> {
            entity.setStatus(UploadStatus.COMPLETED);
            entity.setConfirmedAt(LocalDateTime.now());
            fileUploadRepository.save(entity);
        });

        session.setStatus(UploadStatus.COMPLETED);
        sessionStore.save(session, multipartProperties.getSessionExpiration());

        return buildCompletedFileUploadResponse(session);
    }

    @Override
    @Transactional
    public void abortMultipartUpload(String sessionId, String username) {
        MultipartUploadSession session = sessionStore.findById(sessionId)
                .orElseThrow(() -> new DataNotFoundException("Upload session not found."));

        if (!session.getUsername().equals(username)) {
            throw new BadRequestException("Upload session not found.");
        }

        if (session.getStatus() == UploadStatus.COMPLETED) {
            throw new BadRequestException("Cannot abort an already completed upload session.");
        }

        if (session.getStatus() == UploadStatus.FAILED) {
            log.info("Upload session {} is already marked as failed/aborted.", sessionId);
            return;
        }

        try {
            AbortMultipartUploadRequest abortRequest = AbortMultipartUploadRequest.builder()
                    .bucket(session.getBucketName())
                    .key(session.getObjectKey())
                    .uploadId(session.getUploadId())
                    .build();

            s3Client.abortMultipartUpload(abortRequest);
        } catch (NoSuchKeyException | NoSuchUploadException e) {
            log.warn("Multipart upload already aborted or not found on S3: uploadId={}", session.getUploadId());
        } catch (Exception e) {
            log.error("Failed to abort multipart upload on S3: sessionId={}, uploadId={}", sessionId, session.getUploadId(), e);
            throw new ServerInternalException("Failed to abort multipart upload: " + e.getMessage());
        }

        fileUploadRepository.findByObjectKey(session.getFullObjectKey()).ifPresent(entity -> {
            entity.setStatus(UploadStatus.FAILED);
            fileUploadRepository.save(entity);
        });

        session.setStatus(UploadStatus.FAILED);
        sessionStore.save(session, multipartProperties.getSessionExpiration());
    }

    @Override
    public MultipartUploadStatusResponse getMultipartUploadStatus(String sessionId, String username) {
        MultipartUploadSession session = sessionStore.findById(sessionId)
                .orElseThrow(() -> new DataNotFoundException("Upload session not found."));

        if (!session.getUsername().equals(username)) {
            throw new BadRequestException("Upload session not found.");
        }

        List<Integer> uploadedParts = new ArrayList<>();
        if (session.getStatus() == UploadStatus.PENDING) {
            try {
                ListPartsRequest listPartsRequest = ListPartsRequest.builder()
                        .bucket(session.getBucketName())
                        .key(session.getObjectKey())
                        .uploadId(session.getUploadId())
                        .build();

                ListPartsResponse listPartsResponse = s3Client.listParts(listPartsRequest);
                if (listPartsResponse.hasParts()) {
                    uploadedParts = listPartsResponse.parts().stream()
                            .map(Part::partNumber)
                            .sorted()
                            .toList();
                }
            } catch (Exception e) {
                log.warn("Could not list parts from S3 for sessionId: {}", sessionId, e);
            }
        }

        return MultipartUploadStatusResponse.builder()
                .sessionId(sessionId)
                .objectKey(session.getFullObjectKey())
                .status(session.getStatus())
                .totalParts(session.getTotalParts())
                .fileSize(session.getFileSize())
                .chunkSize(session.getChunkSize())
                .uploadedParts(uploadedParts)
                .build();
    }

    private void validateInitRequest(MultipartUploadInitRequest request) {
        if (!StringUtils.hasText(request.getFileName())) {
            throw new BadRequestException("File name must not be blank.");
        }
        if (!StringUtils.hasText(request.getContentType())) {
            throw new BadRequestException("Content type must not be blank.");
        }
        if (request.getFileSize() == null || request.getFileSize() <= 0) {
            throw new BadRequestException("File size must be greater than 0.");
        }
    }

    private MultipartUploadSession findAndValidateActiveSession(String sessionId, String username) {
        MultipartUploadSession session = sessionStore.findById(sessionId)
                .orElseThrow(() -> new DataNotFoundException("Upload session not found or expired: " + sessionId));

        if (!session.getUsername().equals(username)) {
            throw new BadRequestException("Upload session not found.");
        }

        if (session.getStatus() != UploadStatus.PENDING) {
            throw new IllegalStateException("Upload session is not active: " + session.getStatus());
        }

        if (session.getExpiresAt() != null && LocalDateTime.now().isAfter(session.getExpiresAt())) {
            throw new DataNotFoundException("Upload session expired.");
        }

        return session;
    }

    private MultipartUploadSession findAndValidateSessionForComplete(String sessionId, String username) {
        MultipartUploadSession session = sessionStore.findById(sessionId)
                .orElseThrow(() -> new DataNotFoundException("Upload session not found."));

        if (!session.getUsername().equals(username)) {
            throw new BadRequestException("Upload session not found.");
        }

        if (session.getStatus() == UploadStatus.FAILED) {
            throw new IllegalStateException("Upload session has failed or been aborted.");
        }

        if (session.getExpiresAt() != null && LocalDateTime.now().isAfter(session.getExpiresAt())) {
            throw new DataNotFoundException("Upload session expired.");
        }

        return session;
    }

    private void validateCompleteParts(MultipartUploadCompleteRequest request, int expectedTotalParts) {
        if (request == null || request.getParts() == null || request.getParts().isEmpty()) {
            throw new BadRequestException("Parts list cannot be empty.");
        }

        if (request.getParts().size() != expectedTotalParts) {
            throw new BadRequestException(String.format(
                    "Missing parts: expected %d parts, but received %d",
                    expectedTotalParts, request.getParts().size()));
        }

        Set<Integer> seenPartNumbers = new HashSet<>();
        for (MultipartUploadPartDto part : request.getParts()) {
            if (part.getPartNumber() == null || part.getPartNumber() < 1 || part.getPartNumber() > expectedTotalParts) {
                throw new BadRequestException("Invalid partNumber: " + part.getPartNumber());
            }
            if (!seenPartNumbers.add(part.getPartNumber())) {
                throw new BadRequestException("Duplicate partNumber: " + part.getPartNumber());
            }
            if (!StringUtils.hasText(part.getETag())) {
                throw new BadRequestException("ETag must not be blank for part: " + part.getPartNumber());
            }
        }

        if (seenPartNumbers.size() != expectedTotalParts) {
            throw new BadRequestException("Incomplete part list: some parts are missing.");
        }
    }

    private int calculateTotalParts(long fileSize, long chunkSize) {
        if (fileSize <= 0 || chunkSize <= 0) {
            return 1;
        }
        int totalParts = (int) Math.ceil((double) fileSize / chunkSize);
        return Math.max(1, totalParts);
    }

    private String cleanETag(String eTag) {
        if (eTag == null) return null;
        String trimmed = eTag.trim();
        if (trimmed.startsWith("\"") && trimmed.endsWith("\"") && trimmed.length() >= 2) {
            return trimmed.substring(1, trimmed.length() - 1);
        }
        return trimmed;
    }

    private FileUploadResponse buildCompletedFileUploadResponse(MultipartUploadSession session) {
        String downloadUrl = generateDownloadUrl(session.getBucketName(), session.getObjectKey());
        String publicUrlStr = Boolean.TRUE.equals(session.getIsPublic())
                ? resolvePublicUrl(session.getObjectKey())
                : null;

        return FileUploadResponse.builder()
                .originalFileName(session.getFileName())
                .contentType(session.getContentType())
                .fileSize(session.getFileSize())
                .objectKey(session.getFullObjectKey())
                .publicUrl(publicUrlStr)
                .downloadUrl(downloadUrl)
                .build();
    }

    private String generateDownloadUrl(String bucket, String key) {
        return s3Presigner.presignGetObject(
                GetObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofMinutes(2))
                        .getObjectRequest(GetObjectRequest.builder()
                                .bucket(bucket)
                                .key(key)
                                .build())
                        .build())
                .url().toString();
    }

    private String resolvePublicUrl(String objectKey) {
        String base = publicUrl != null ? publicUrl : "";
        if (!objectKey.startsWith("/") && !base.endsWith("/")) {
            base += "/";
        }
        return base + objectKey;
    }

    private String generateObjectKey(String filename) {
        return String.format("%s/%s-%s", "dev_edu", System.currentTimeMillis(), filename);
    }
}
