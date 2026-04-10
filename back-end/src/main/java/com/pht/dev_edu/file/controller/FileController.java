package com.pht.dev_edu.file.controller;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.util.ApiUtil;
import com.pht.dev_edu.common.util.SecurityContextUtil;
import com.pht.dev_edu.file.dto.FilePreSignUploadRequest;
import com.pht.dev_edu.file.service.FileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController("FileController")
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class FileController {
    FileService fileController;

    @PostMapping("/pre-signed-url")
    public ResponseEntity<ApiResponse> uploadFile(@Valid @RequestBody FilePreSignUploadRequest req) {
        var fileInfo = fileController.generatePreSignedUrl(req);
        return ApiUtil.buildSuccessResponse(fileInfo);
    }

    @GetMapping("/download")
    public ResponseEntity<ApiResponse> getDownloadInfo(@RequestParam String fullObjectKey) {
        var fileInfo = fileController.getFileInfo(fullObjectKey);
        return ApiUtil.buildSuccessResponse(fileInfo);
    }

    @PostMapping("/confirm-image-upload")
    public ResponseEntity<ApiResponse> confirmImageUpload(@RequestParam String fullObjectKey) {
        String username = SecurityContextUtil.getCurrentUsernameForController();
        var fileUrl = fileController.confirmImageUpload(username, fullObjectKey);
        return ApiUtil.buildSuccessResponse(fileUrl);
    }
}
