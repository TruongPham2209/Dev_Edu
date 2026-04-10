package com.pht.dev_edu.lecture.controller;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.util.ApiUtil;
import com.pht.dev_edu.common.util.SecurityContextUtil;
import com.pht.dev_edu.common.validation.CreateValidation;
import com.pht.dev_edu.common.validation.UpdateValidation;
import com.pht.dev_edu.lecture.dto.LectureRequest;
import com.pht.dev_edu.lecture.dto.MaterialRequest;
import com.pht.dev_edu.lecture.dto.ProgressSegmentRequest;
import com.pht.dev_edu.lecture.service.LectureService;
import com.pht.dev_edu.lecture.service.MaterialService;
import com.pht.dev_edu.lecture.service.ProgressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.UUID;

@RestController("LectureController")
@RequestMapping("/api/v1/lectures")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class LectureController {
    LectureService lectureService;
    MaterialService materialService;
    ProgressService progressService;

    @PreAuthorize("permitAll()")
    @GetMapping
    public ResponseEntity<ApiResponse> getAllByCourse(@RequestParam UUID courseId) {
        String username = SecurityContextUtil.getCurrentUsername();
        Set<String> authorities = SecurityContextUtil.getCurrentUserAuthorities();
        var lectures = lectureService.getLecturesByCourse(authorities, username, courseId);
        return ApiUtil.buildSuccessResponse(lectures);
    }

    @GetMapping("/{lectureId}")
    public ResponseEntity<ApiResponse> getLecture(@PathVariable UUID lectureId) {
        String username = SecurityContextUtil.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtil.getCurrentUserAuthorities();
        var lecture = lectureService.getLecture(authorities, username, lectureId);
        return ApiUtil.buildSuccessResponse(lecture);
    }

    @GetMapping("/{lectureId}/materials")
    public ResponseEntity<ApiResponse> getMaterials(@PathVariable UUID lectureId) {
        String username = SecurityContextUtil.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtil.getCurrentUserAuthorities();
        var materials = materialService.getMaterialsByLecture(authorities, username, lectureId);
        return ApiUtil.buildSuccessResponse(materials);
    }

    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse> createLecture(@Validated({CreateValidation.class}) @RequestBody LectureRequest req) {
        String username = SecurityContextUtil.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtil.getCurrentUserAuthorities();
        var lecture = lectureService.createLecture(authorities, username, req);
        return ApiUtil.buildSuccessResponse(lecture);
    }

    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    @PostMapping("/materials")
    public ResponseEntity<ApiResponse> createMaterials(@Valid @RequestBody MaterialRequest req) {
        String username = SecurityContextUtil.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtil.getCurrentUserAuthorities();
        var material = materialService.create(authorities, username, req);
        return ApiUtil.buildSuccessResponse(material);
    }

    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    @PutMapping
    public ResponseEntity<ApiResponse> updateLecture(@Validated({UpdateValidation.class}) @RequestBody LectureRequest req) {
        String username = SecurityContextUtil.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtil.getCurrentUserAuthorities();
        var lecture = lectureService.updateLecture(authorities, username, req);
        return ApiUtil.buildSuccessResponse(lecture);
    }

    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    @DeleteMapping
    public ResponseEntity<ApiResponse> deleteLecture(@RequestParam UUID lectureId) {
        String username = SecurityContextUtil.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtil.getCurrentUserAuthorities();
        lectureService.deleteLecture(authorities, username, lectureId);
        return ApiUtil.buildSuccessResponse("Lecture deleted successfully");
    }

    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    @DeleteMapping("/materials")
    public ResponseEntity<ApiResponse> deleteMaterial(@RequestParam UUID materialId) {
        String username = SecurityContextUtil.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtil.getCurrentUserAuthorities();
        materialService.delete(authorities, username, materialId);
        return ApiUtil.buildSuccessResponse("Material deleted successfully");
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PutMapping("/progress")
    public ResponseEntity<ApiResponse> updateProgress(@RequestBody ProgressSegmentRequest req) {
        String username = SecurityContextUtil.getCurrentUsernameForController();
        progressService.updateProgress(username, req);
        return ApiUtil.buildSuccessResponse("Progress updated successfully");
    }
}
