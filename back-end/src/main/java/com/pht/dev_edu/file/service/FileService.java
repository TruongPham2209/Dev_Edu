package com.pht.dev_edu.file.service;

import com.pht.dev_edu.file.dto.FilePreSignUploadRequest;
import com.pht.dev_edu.file.dto.FileUploadResponse;

public interface FileService {
    FileUploadResponse generatePreSignedUrl(FilePreSignUploadRequest request);

    // For download, we can generate a pre-signed URL for private files, but for public files, we can directly return the URL.
    FileUploadResponse getFileInfo(String fullObjectKey);

    // For validate file
    FileUploadResponse getFileInfo(String username, String fullObjectKey);

    // Using when upload image on text editor, we want to validate file immediately after upload, so we can return the URL if valid, otherwise we can delete the file and return error message.
    String confirmImageUpload(String username, String fullObjectKey);

    void deleteFile(String fullObjectKey);
}
