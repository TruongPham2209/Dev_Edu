package com.pht.dev_edu.file.service;

import com.pht.dev_edu.file.dto.*;

/**
 * Service orchestrating chunked / multipart file uploads to S3 / Cloudflare R2.
 */
public interface FileMultipartService {

    /**
     * Initiates a multipart upload on S3/R2 and creates an upload session.
     *
     * @param request the multipart initialization parameters (filename, contentType, fileSize, isPublic).
     * @return {@link MultipartUploadInitResponse} containing sessionId, chunkSize, totalParts, windowSize, and concurrency.
     */
    MultipartUploadInitResponse initMultipartUpload(MultipartUploadInitRequest request);

    /**
     * Generates a batch of presigned URLs for specific part numbers locally using Signature V4.
     * Does NOT perform HTTP calls to S3/R2.
     *
     * @param sessionId the multipart upload session ID.
     * @param request   the presign request specifying fromPart and optional partCount.
     * @param username  the username requesting presigned URLs (for ownership validation).
     * @return {@link MultipartUploadPresignResponse} containing the generated presigned part URLs.
     */
    MultipartUploadPresignResponse presignMultipartParts(String sessionId, MultipartUploadPresignRequest request, String username);

    /**
     * Completes a multipart upload on S3/R2 after all chunks have been uploaded directly by the client.
     *
     * @param sessionId the multipart upload session ID.
     * @param request   the completion request containing the list of part numbers and corresponding ETags.
     * @param username  the username of the session owner.
     * @return {@link FileUploadResponse} representing the completed file metadata.
     */
    FileUploadResponse completeMultipartUpload(String sessionId, MultipartUploadCompleteRequest request, String username);

    /**
     * Aborts an active multipart upload on S3/R2 and frees associated storage/session resources.
     *
     * @param sessionId the multipart upload session ID.
     * @param username  the username of the session owner.
     */
    void abortMultipartUpload(String sessionId, String username);

    /**
     * Retrieves the status of a multipart upload session and inspects uploaded parts from S3/R2.
     *
     * @param sessionId the multipart upload session ID.
     * @param username  the username of the session owner.
     * @return {@link MultipartUploadStatusResponse} containing session and uploaded part details.
     */
    MultipartUploadStatusResponse getMultipartUploadStatus(String sessionId, String username);
}
