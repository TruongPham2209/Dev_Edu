package com.pht.dev_edu.file.controller;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
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
        var username = SecurityContextUtils.getCurrentUsername();
        req.setUsername(username);

        var fileInfo = fileController.generatePreSignedUrl(req);
        return ApiUtils.buildSuccessResponse(fileInfo);
    }

    @GetMapping("/metadata")
    public ResponseEntity<ApiResponse> getFileInfo(@RequestParam String fullObjectKey) {
        var fileInfo = fileController.getFileInfoDetail(fullObjectKey);
        return ApiUtils.buildSuccessResponse(fileInfo);
    }

    @GetMapping("/download")
    public ResponseEntity<ApiResponse> getDownloadInfo(@RequestParam String fullObjectKey) {
        var fileInfo = fileController.getFileInfo(fullObjectKey);
        return ApiUtils.buildSuccessResponse(fileInfo);
    }

    @PostMapping("/confirm-image-upload")
    public ResponseEntity<ApiResponse> confirmImageUpload(@RequestParam String fullObjectKey) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        var fileUrl = fileController.confirmImageUpload(username, fullObjectKey);
        return ApiUtils.buildSuccessResponse(fileUrl);
    }
}
