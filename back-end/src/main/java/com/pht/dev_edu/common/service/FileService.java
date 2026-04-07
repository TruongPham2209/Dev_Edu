package com.pht.dev_edu.common.service;

import com.pht.dev_edu.common.dto.FilePreSignUploadRequest;
import com.pht.dev_edu.common.dto.FileUploadResponse;

public interface FileService {
    FileUploadResponse generatePreSignedUrl(FilePreSignUploadRequest request);

    FileUploadResponse getFileInfo(String fullObjectKey);

    void deleteFile(String fullObjectKey);
}
