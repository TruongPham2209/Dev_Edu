package com.pht.dev_edu.file.controller;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.file.dto.*;
import com.pht.dev_edu.file.service.FileMultipartService;
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
    FileMultipartService fileMultipartService;

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

    // ==================== Chunked / Multipart Upload Endpoints ====================

    @PostMapping("/chunk-upload/init")
    public ResponseEntity<ApiResponse> initChunkUpload(@Valid @RequestBody MultipartUploadInitRequest req) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        req.setUsername(username);

        var initResponse = fileMultipartService.initMultipartUpload(req);
        return ApiUtils.buildSuccessResponse(initResponse);
    }

    @PostMapping("/chunk-upload/{sessionId}/presign")
    public ResponseEntity<ApiResponse> presignChunkParts(
            @PathVariable String sessionId,
            @Valid @RequestBody MultipartUploadPresignRequest req) {
        String username = SecurityContextUtils.getCurrentUsernameForController();

        var presignResponse = fileMultipartService.presignMultipartParts(sessionId, req, username);
        return ApiUtils.buildSuccessResponse(presignResponse);
    }

    @PostMapping("/chunk-upload/{sessionId}/complete")
    public ResponseEntity<ApiResponse> completeChunkUpload(
            @PathVariable String sessionId,
            @Valid @RequestBody MultipartUploadCompleteRequest req) {
        String username = SecurityContextUtils.getCurrentUsernameForController();

        var completeResponse = fileMultipartService.completeMultipartUpload(sessionId, req, username);
        return ApiUtils.buildSuccessResponse(completeResponse);
    }

    @DeleteMapping("/chunk-upload/{sessionId}")
    public ResponseEntity<ApiResponse> abortChunkUpload(@PathVariable String sessionId) {
        String username = SecurityContextUtils.getCurrentUsernameForController();

        fileMultipartService.abortMultipartUpload(sessionId, username);
        return ApiUtils.buildSuccessResponse("Multipart upload aborted successfully.");
    }

    @GetMapping("/chunk-upload/{sessionId}/status")
    public ResponseEntity<ApiResponse> getChunkUploadStatus(@PathVariable String sessionId) {
        String username = SecurityContextUtils.getCurrentUsernameForController();

        var statusResponse = fileMultipartService.getMultipartUploadStatus(sessionId, username);
        return ApiUtils.buildSuccessResponse(statusResponse);
    }
}
