package com.pht.dev_edu.quiz.controller;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.quiz.dto.response.CourseDocumentResponse;
import com.pht.dev_edu.quiz.dto.response.DocumentUploadAuditResponse;
import com.pht.dev_edu.quiz.entity.DocumentUploadAuditEntity;
import com.pht.dev_edu.quiz.repo.DocumentUploadAuditRepository;
import com.pht.dev_edu.quiz.service.CourseDocumentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController("CourseDocumentController")
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseDocumentController {
    CourseDocumentService courseDocumentService;
    DocumentUploadAuditRepository auditRepository;

    @GetMapping("/library")
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getGlobalDocumentLibrary(
            @RequestParam(value = "nextCursor", required = false) String nextCursor,
            @RequestParam(value = "fileName", required = false) String fileName) {
        var paging = courseDocumentService.getGlobalDocumentLibrary(nextCursor, fileName);
        return ApiUtils.buildSuccessResponse(paging);
    }

    @PostMapping(value = "/library/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse> uploadGlobalDocumentByAdmin(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        CourseDocumentResponse response = courseDocumentService.uploadGlobalDocumentByAdmin(file, title, username);
        return ApiUtils.buildSuccessResponse(response);
    }

    @DeleteMapping("/library/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse> deleteGlobalDocument(@PathVariable("id") UUID documentId) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        courseDocumentService.deleteGlobalDocument(documentId, username);
        return ApiUtils.buildSuccessResponse("Deleted global document successfully.");
    }

    @GetMapping("/audits/course/{courseId}")
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getDocumentUploadAuditsByCourse(@PathVariable("courseId") UUID courseId) {
        List<DocumentUploadAuditEntity> audits = auditRepository.findByCourseIdOrderByCreatedAtDesc(courseId);

        List<DocumentUploadAuditResponse> responses = audits.stream()
                .map(a -> DocumentUploadAuditResponse.builder()
                        .id(a.getId())
                        .uploadedBy(a.getUploadedBy())
                        .userRole(a.getUserRole())
                        .fileName(a.getFileName())
                        .fileSize(a.getFileSize())
                        .contentHash(a.getContentHash())
                        .quizId(a.getQuizId())
                        .courseId(a.getCourseId())
                        .generationJobId(a.getGenerationJobId())
                        .requestedSave(a.getRequestedSave())
                        .isPromoted(a.getIsPromoted())
                        .promotionStatus(a.getPromotionStatus())
                        .failureReason(a.getFailureReason())
                        .createdAt(a.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ApiUtils.buildSuccessResponse(responses);
    }
}
