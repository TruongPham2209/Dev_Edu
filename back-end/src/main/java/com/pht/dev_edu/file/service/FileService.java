package com.pht.dev_edu.file.service;

import com.pht.dev_edu.file.dto.FilePreSignUploadRequest;
import com.pht.dev_edu.file.dto.FileUploadResponse;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service for managing file storage, pre-signed upload URLs, multipart uploads, and retrieval from Object Storage (S3 / Cloudflare R2).
 */
public interface FileService {

    /**
     * Generates a pre-signed URL for direct client-side upload to S3/R2.
     *
     * @param request the {@link FilePreSignUploadRequest} containing file name, content type, file size, and visibility.
     * @return the {@link FileUploadResponse} containing pre-signed URL and object key.
     */
    FileUploadResponse generatePreSignedUrl(FilePreSignUploadRequest request);

    /**
     * Uploads a multipart file directly to S3/R2 storage from the backend server.
     *
     * @param file     the {@link MultipartFile} to upload.
     * @param isPublic whether the file should be saved in the public or private bucket.
     * @param username the username of the uploading user.
     * @return the {@link FileUploadResponse} containing file metadata and access URL.
     */
    FileUploadResponse uploadDirectFile(MultipartFile file, boolean isPublic, String username);

    /**
     * Retrieves file metadata and access URL (pre-signed GET URL for private files, direct URL for public files).
     *
     * @param fullObjectKey the full object key path including bucket name (e.g. "bucket_name/object_key").
     * @return the {@link FileUploadResponse}.
     */
    FileUploadResponse getFileInfo(String fullObjectKey);

    /**
     * Retrieves detailed file metadata from both the database and S3 storage.
     *
     * @param fullObjectKey the full object key of the file.
     * @return the {@link FileUploadResponse}.
     */
    FileUploadResponse getFileInfoDetail(String fullObjectKey);

    /**
     * Validates an uploaded file on S3 (checks existence, file size, content-type) and transitions its status to COMPLETED.
     *
     * @param username      the username of the file owner.
     * @param fullObjectKey the full object key of the file.
     * @return the validated {@link FileUploadResponse}.
     */
    FileUploadResponse getFileInfo(String username, String fullObjectKey);

    /**
     * Confirms and validates an image upload immediately from a rich-text editor, returning its public URL.
     *
     * @param username      the username of the uploading user.
     * @param fullObjectKey the full object key of the image.
     * @return the public URL string for the image.
     */
    String confirmImageUpload(String username, String fullObjectKey);

    /**
     * Deletes a file from Object Storage (S3/R2) and removes its tracking record from the database.
     *
     * @param fullObjectKey the full object key of the file to delete.
     */
    void deleteFile(String fullObjectKey);

    /**
     * Extracts video duration in seconds by probing video metadata using ffprobe.
     *
     * @param fullObjectKey the full object key of the video.
     * @return the video duration in seconds.
     */
    int getVideoDuration(String fullObjectKey);

    /**
     * Downloads the raw byte content of a file from S3/R2 into memory.
     *
     * @param fullObjectKey the full object key of the file.
     * @return the byte array of the file content.
     */
    byte[] downloadFileBytes(String fullObjectKey);
}
