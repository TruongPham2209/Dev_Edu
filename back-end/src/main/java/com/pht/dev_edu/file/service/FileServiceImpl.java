package com.pht.dev_edu.file.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

import org.apache.commons.lang3.tuple.Pair;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.exception.server.ServerInternalException;
import com.pht.dev_edu.common.util.FileContentTypeUtils;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.file.dto.FilePreSignUploadRequest;
import com.pht.dev_edu.file.dto.FileUploadResponse;
import com.pht.dev_edu.file.dto.UploadStatus;
import com.pht.dev_edu.file.entity.FileUploadEntity;
import com.pht.dev_edu.file.repo.FileUploadRepository;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class FileServiceImpl implements FileService {
    FileUploadRepository fileUploadRepository;
    S3Presigner s3Presigner;
    S3Client s3Client;

    @NonFinal
    @Value("${cloudflare.r2.public-bucket-name}")
    String publicBucketName;

    @NonFinal
    @Value("${cloudflare.r2.private-bucket-name}")
    String privateBucketName;

    @NonFinal
    @Value("${cloudflare.r2.public-url}")
    String publicUrl;

    private static final Duration PRIVATE_FILE_PRESIGNED_DURATION = Duration.ofMinutes(15);
    private static final Duration PUBLIC_FILE_PRESIGNED_DURATION = Duration.ofHours(30);

    private static final Long MAX_EXPIRED_FILE_DURATION_MINUTES = 15L; // 15 phút, nếu quá thời gian này mà file vẫn
                                                                       // chưa được upload thì sẽ bị xóa để tránh rác
                                                                       // lưu trữ

    @Override
    @Transactional
    public FileUploadResponse generatePreSignedUrl(FilePreSignUploadRequest request) {
        String objectKey = generateObjectKey(request.getFileName());
        boolean isPublic = Boolean.TRUE.equals(request.getIsPublic());
        var bucketName = isPublic ? publicBucketName : privateBucketName;
        String fullObjectKey = bucketName + "/" + objectKey;

        var fileUpload = FileUploadEntity.builder()
                .objectKey(fullObjectKey)
                .fileName(request.getFileName())
                .contentType(request.getContentType())
                .status(UploadStatus.PENDING)
                .fileSize(request.getFileSize())
                .createdBy(request.getUsername())
                .expiredAt(java.time.LocalDateTime.now().plusMinutes(MAX_EXPIRED_FILE_DURATION_MINUTES))
                .build();
        fileUploadRepository.save(fileUpload);

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .contentType(request.getContentType())
                .build();

        Duration signatureDuration = isPublic ? PUBLIC_FILE_PRESIGNED_DURATION : PRIVATE_FILE_PRESIGNED_DURATION;
        PutObjectPresignRequest preSignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(signatureDuration)
                .putObjectRequest(putObjectRequest)
                .build();

        String uploadUrl = s3Presigner.presignPutObject(preSignRequest)
                .url()
                .toString();

        String publicUrl = isPublic
                ? resolvePublicUrl(objectKey)
                : null;

        return FileUploadResponse.builder()
                .originalFileName(request.getFileName())
                .contentType(request.getContentType())
                .uploadUrl(uploadUrl)
                .objectKey(fullObjectKey)
                .publicUrl(publicUrl)
                .build();
    }

    @Override
    @Transactional
    public FileUploadResponse uploadDirectFile(org.springframework.web.multipart.MultipartFile file, boolean isPublic, String username) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty.");
        }

        String originalFileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf";
        String contentType = file.getContentType() != null ? file.getContentType() : "application/pdf";
        String objectKey = generateObjectKey(originalFileName);
        var bucketName = isPublic ? publicBucketName : privateBucketName;
        String fullObjectKey = bucketName + "/" + objectKey;

        try {
            byte[] bytes = file.getBytes();
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .contentType(contentType)
                    .build();

            s3Client.putObject(putObjectRequest, software.amazon.awssdk.core.sync.RequestBody.fromBytes(bytes));

            var fileUpload = FileUploadEntity.builder()
                    .objectKey(fullObjectKey)
                    .fileName(originalFileName)
                    .contentType(contentType)
                    .status(UploadStatus.PENDING)
                    .fileSize(file.getSize())
                    .createdBy(username)
                    .expiredAt(LocalDateTime.now().plusMinutes(MAX_EXPIRED_FILE_DURATION_MINUTES))
                    .build();
            fileUploadRepository.save(fileUpload);

            return FileUploadResponse.builder()
                    .originalFileName(originalFileName)
                    .contentType(contentType)
                    .fileSize(file.getSize())
                    .objectKey(fullObjectKey)
                    .publicUrl(isPublic ? resolvePublicUrl(objectKey) : null)
                    .build();
        } catch (Exception e) {
            log.error("Failed to upload direct multipart file: {}", originalFileName, e);
            throw new ServerInternalException("Failed to upload file to storage: " + e.getMessage());
        }
    }

    @Override
    public FileUploadResponse getFileInfo(String fullObjectKey) {
        Pair<String, String> pair = parseFullObjectKey(fullObjectKey);
        String bucket = pair.getLeft();
        String key = pair.getRight();

        HeadObjectResponse head = headObject(bucket, key);

        String downloadUrl = s3Presigner.presignGetObject(
                GetObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofMinutes(2))
                        .getObjectRequest(GetObjectRequest.builder()
                                .bucket(bucket)
                                .key(key)
                                .build())
                        .build())
                .url().toString();

        return FileUploadResponse.builder()
                .contentType(head.contentType())
                .fileSize(head.contentLength())
                .objectKey(fullObjectKey)
                .downloadUrl(downloadUrl)
                .publicUrl(bucket.equals(publicBucketName) ? resolvePublicUrl(key) : null)
                .build();
    }

    @Override
    public FileUploadResponse getFileInfoDetail(String fullObjectKey) {
        var fileUpload = fileUploadRepository.findByObjectKey(fullObjectKey)
                .orElseThrow(() -> new DataNotFoundException("File not found."));
        Pair<String, String> pair = parseFullObjectKey(fullObjectKey);
        String bucket = pair.getLeft();
        String key = pair.getRight();

        HeadObjectResponse head = headObject(bucket, key);
        return FileUploadResponse.builder()
                .originalFileName(fileUpload.getFileName())
                .contentType(head.contentType())
                .fileSize(head.contentLength())
                .objectKey(fullObjectKey)
                .publicUrl(bucket.equals(publicBucketName) ? resolvePublicUrl(key) : null)
                .build();
    }

    @Override
    @Transactional
    public FileUploadResponse getFileInfo(String username, String fullObjectKey) {
        var fileUpload = fileUploadRepository.findByObjectKey(fullObjectKey)
                .orElseThrow(() -> new DataNotFoundException("File not found."));

        if (!fileUpload.getCreatedBy().equals(username)) {
            throw new BadRequestException("File not found.");
        }

        if (fileUpload.getStatus() == UploadStatus.FAILED) {
            throw new IllegalStateException("Upload file failed.");
        }

        // expired + grace
        if (LocalDateTime.now().isAfter(fileUpload.getExpiredAt().plusMinutes(1))) {
            KafkaUtils.sendDeleteFileEvent(fullObjectKey);
            throw new DataNotFoundException("File expired.");
        }

        // nếu đã complete → chỉ return
        if (fileUpload.getStatus() == UploadStatus.COMPLETED) {
            try {
                return getFileInfo(fullObjectKey);
            } catch (NoSuchKeyException e) {
                KafkaUtils.sendDeleteFileEvent(fullObjectKey);
                log.error("File not found on S3 for object key: {}", fullObjectKey);
                throw new DataNotFoundException("File not found.");
            }
        }

        // ===== HEAD OBJECT (chỉ 1 lần) =====
        Pair<String, String> pair = parseFullObjectKey(fullObjectKey);
        String bucket = pair.getLeft();
        String key = pair.getRight();

        HeadObjectResponse head;
        try {
            head = headObject(bucket, key);
        } catch (NoSuchKeyException e) {
            fileUpload.setStatus(UploadStatus.FAILED);
            fileUploadRepository.save(fileUpload);

            log.error("File not found on S3 for object key: {}", fullObjectKey);
            throw new DataNotFoundException("File not found.");
        }

        // ===== VALIDATE =====
        validateFile(head, fileUpload);

        // ===== SUCCESS =====
        fileUpload.setStatus(UploadStatus.COMPLETED);
        fileUpload.setConfirmedAt(LocalDateTime.now());
        fileUploadRepository.save(fileUpload);

        return FileUploadResponse.builder()
                .objectKey(fullObjectKey)
                .contentType(head.contentType())
                .fileSize(head.contentLength())
                .originalFileName(fileUpload.getFileName())
                .downloadUrl(generateDownloadUrl(bucket, key))
                .publicUrl(bucket.equals(publicBucketName) ? resolvePublicUrl(key) : null)
                .build();
    }

    @Override
    public String confirmImageUpload(String username, String fullObjectKey) {
        var fileUpload = fileUploadRepository.findByObjectKey(fullObjectKey)
                .orElseThrow(() -> new DataNotFoundException("File not found."));

        if (!fileUpload.getCreatedBy().equals(username)) {
            throw new BadRequestException("File not found.");
        }

        if (fileUpload.getStatus() == UploadStatus.FAILED) {
            KafkaUtils.sendDeleteFileEvent(fullObjectKey);
            throw new IllegalStateException("Upload file failed.");
        }

        // expired + grace
        if (LocalDateTime.now().isAfter(fileUpload.getExpiredAt().plusMinutes(1))) {
            KafkaUtils.sendDeleteFileEvent(fullObjectKey);
            throw new DataNotFoundException("File expired.");
        }

        boolean isImage = FileContentTypeUtils.isValidContentType(
                fileUpload.getContentType(),
                FileContentTypeUtils.FileType.IMAGE);
        if (!isImage) {
            throw new BadRequestException("File is not an image.");
        }

        var fileInfo = getFileInfo(fullObjectKey);
        if (fileInfo == null) {
            throw new DataNotFoundException("File not found.");
        }
        if (!StringUtils.hasText(fileInfo.getPublicUrl())) {
            throw new IllegalStateException("File is not public.");
        }

        fileUpload.setConfirmedAt(LocalDateTime.now());
        fileUpload.setStatus(UploadStatus.COMPLETED);
        fileUploadRepository.save(fileUpload);
        return fileInfo.getPublicUrl();
    }

    @Override
    @Transactional
    public void deleteFile(String fullObjectKey) {
        try {
            Pair<String, String> pair = parseFullObjectKey(fullObjectKey);
            String bucket = pair.getLeft();
            String key = pair.getRight();

            s3Client.deleteObject(
                    DeleteObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .build());
        } catch (NoSuchKeyException e) {
            log.error("File to delete not found: {}", fullObjectKey);
        }

        // Xóa record trong database nếu có
        fileUploadRepository.deleteByObjectKey(fullObjectKey);
    }

    @Override
    public int getVideoDuration(String fullObjectKey) {
        var fileInfo = getFileInfo(fullObjectKey);

        if (fileInfo == null) {
            throw new DataNotFoundException("File not found.");
        }

        if (!fileInfo.getContentType().startsWith("video/")) {
            throw new BadRequestException("File is not a video.");
        }

        try {
            String videoUrl = fileInfo.getDownloadUrl();

            ProcessBuilder pb = new ProcessBuilder(
                    "ffprobe",
                    "-v", "error",
                    "-show_entries", "format=duration",
                    "-of", "default=noprint_wrappers=1:nokey=1",
                    videoUrl);

            pb.redirectErrorStream(true);

            Process process = pb.start();

            // 3. Đọc output
            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()));

            String output = reader.readLine();

            // 4. Timeout (quan trọng)
            boolean finished = process.waitFor(5, TimeUnit.SECONDS);

            if (!finished) {
                process.destroyForcibly();
                throw new ServerInternalException("ffprobe timeout");
            }

            if (output == null || output.isBlank()) {
                throw new ServerInternalException("Cannot read video duration");
            }

            // 5. Parse duration (seconds → int)
            double duration = Double.parseDouble(output);

            return (int) Math.ceil(duration);

        } catch (Exception e) {
            log.error("Failed to get video duration for file: {}", fullObjectKey, e);
            throw new ServerInternalException("Failed to get video duration");
        }
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
        if (!objectKey.startsWith("/") && !publicUrl.endsWith("/")) {
            publicUrl += "/";
        }
        return publicUrl + objectKey;
    }

    private String generateObjectKey(String filename) {
        return String.format("%s/%s-%s", "dev_edu", System.currentTimeMillis(), filename);
    }

    private HeadObjectResponse headObject(String bucket, String key) {
        try {
            return s3Client.headObject(
                    HeadObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .build());
        } catch (NoSuchKeyException e) {
            throw new DataNotFoundException("File not found.");
        }
    }

    private Pair<String, String> parseFullObjectKey(String fullObjectKey) {
        int idx = fullObjectKey.indexOf("/");
        if (idx == -1) {
            log.error("Invalid fullObjectKey: {}", fullObjectKey);
            throw new BadRequestException("File not found.");
        }
        return Pair.of(
                fullObjectKey.substring(0, idx),
                fullObjectKey.substring(idx + 1));
    }

    private void validateFile(HeadObjectResponse head, FileUploadEntity fileUpload) {

        // content-type (flexible)
        if (fileUpload.getContentType() != null &&
                (head.contentType() == null ||
                        !head.contentType().startsWith(fileUpload.getContentType()))) {

            log.error("Content type mismatch: expected={}, actual={}",
                    fileUpload.getContentType(), head.contentType());

            KafkaUtils.sendDeleteFileEvent(fileUpload.getObjectKey());
            throw new IllegalStateException("Content type not match.");
        }

        // size (tolerance 1KB)
        if (fileUpload.getFileSize() != null) {
            long diff = Math.abs(head.contentLength() - fileUpload.getFileSize());
            if (diff > 1024) {
                log.error("File size mismatch: expected={}, actual={}",
                        fileUpload.getFileSize(), head.contentLength());

                KafkaUtils.sendDeleteFileEvent(fileUpload.getObjectKey());
                throw new IllegalStateException("File size not match.");
            }
        }
    }

    @Override
    public byte[] downloadFileBytes(String fullObjectKey) {
        if (fullObjectKey == null || fullObjectKey.isBlank()) {
            throw new BadRequestException("Object key cannot be null or empty.");
        }
        var bucketAndKey = parseFullObjectKey(fullObjectKey);
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketAndKey.getLeft())
                    .key(bucketAndKey.getRight())
                    .build();

            return s3Client.getObjectAsBytes(getObjectRequest).asByteArray();
        } catch (NoSuchKeyException e) {
            log.error("File not found in storage for objectKey: {}", fullObjectKey, e);
            throw new DataNotFoundException("File not found in storage: " + fullObjectKey);
        } catch (Exception e) {
            log.error("Failed to download file bytes for objectKey: {}", fullObjectKey, e);
            throw new ServerInternalException("Failed to download file from storage: " + e.getMessage());
        }
    }
}
