package com.pht.dev_edu.common.service;

import com.pht.dev_edu.common.dto.FilePreSignUploadRequest;
import com.pht.dev_edu.common.dto.FileUploadResponse;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class FileServiceImpl implements FileService {
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

    @Override
    public FileUploadResponse generatePreSignedUrl(FilePreSignUploadRequest request) {
        String objectKey = generateObjectKey(request.getFileName());
        var bucketName = request.isPublic() ? publicBucketName : privateBucketName;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .contentType(request.getContentType())
                .build();

        Duration signatureDuration = request.isPublic() ? PUBLIC_FILE_PRESIGNED_DURATION : PRIVATE_FILE_PRESIGNED_DURATION;
        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(signatureDuration)
                .putObjectRequest(putObjectRequest)
                .build();

        String uploadUrl = s3Presigner.presignPutObject(presignRequest)
                .url()
                .toString();

        String publicUrl = request.isPublic()
                ? resolvePublicUrl(objectKey)
                : null;

        String fullObjectKey = bucketName + "/" + objectKey;
        return FileUploadResponse.builder()
                .originalFileName(request.getFileName())
                .originalFileContentType(request.getContentType())
                .uploadUrl(uploadUrl)
                .objectKey(fullObjectKey)
                .publicUrl(publicUrl)
                .build();
    }

    @Override
    public FileUploadResponse getFileInfo(String fullObjectKey) {
        int firstSlashIndex = fullObjectKey.indexOf("/");
        if (firstSlashIndex == -1) {
            log.error("Invalid fullObjectKey: {}", fullObjectKey);
            throw new IllegalArgumentException("File không tồn tại.");
        }

        String bucketName = fullObjectKey.substring(0, firstSlashIndex);
        String objectKey = fullObjectKey.substring(firstSlashIndex + 1);
        try {
            s3Client.headObject(
                    HeadObjectRequest.builder()
                            .bucket(bucketName)
                            .key(objectKey)
                            .build()
            );
        } catch (NoSuchKeyException e) {
            throw new DataNotFoundException("File không tồn tại.");
        }

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .build();

        GetObjectPresignRequest preSignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(2)) // rất ngắn
                .getObjectRequest(getObjectRequest)
                .build();

        var downloadUrl = s3Presigner.presignGetObject(preSignRequest)
                .url()
                .toString();

        String publicUrl = bucketName.equals(publicBucketName)
                ? resolvePublicUrl(objectKey)
                : null;

        return FileUploadResponse.builder()
//                .originalFileName(uploadInfo.getOriginalFilename())
//                .originalFileContentType(uploadInfo.getOriginalFileContentType())
                .objectKey(fullObjectKey)
                .downloadUrl(downloadUrl)
                .uploadUrl(null)
                .publicUrl(publicUrl)
                .build();
    }

    @Override
    public void deleteFile(String fullObjectKey) {
        int idx = fullObjectKey.indexOf("/");
        if (idx <= 0) {
            throw new IllegalArgumentException("Invalid fullObjectKey");
        }

        String bucketName = fullObjectKey.substring(0, idx);
        String objectKey = fullObjectKey.substring(idx + 1);

        try {
            s3Client.deleteObject(
                    DeleteObjectRequest.builder()
                            .bucket(bucketName)
                            .key(objectKey)
                            .build()
            );
        } catch (NoSuchKeyException e) {
            log.error("File to delete not found: {}", fullObjectKey);
        }
    }

    private String resolvePublicUrl(String objectKey) {
        if (!objectKey.startsWith("/") && !publicUrl.endsWith("/")) {
            publicUrl += "/";
        }
        return publicUrl + objectKey;
    }

    private String generateObjectKey(String filename) {
        return String.format("%s/%s-%s", "uploads", System.currentTimeMillis(), filename);
    }
}
