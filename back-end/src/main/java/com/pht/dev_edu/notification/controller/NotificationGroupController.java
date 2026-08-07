package com.pht.dev_edu.notification.controller;

import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.notification.dto.CreateGroupNotificationRequest;
import com.pht.dev_edu.notification.service.NotificationGroupService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController("NotificationGroupController")
@RequestMapping("/api/v1/notifications/group")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationGroupController {
    NotificationGroupService notificationGroupService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createGroupNotification(
            @RequestBody @Valid CreateGroupNotificationRequest request
    ) {
        var createdBy = SecurityContextUtils.getCurrentUsernameForController();
        var result = notificationGroupService.createGroupNotification(request, createdBy);
        return ApiUtils.buildSuccessResponse(result);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGroupNotification(
            @PathVariable UUID id
    ) {
        notificationGroupService.softDeleteGroupNotification(id);
        return ApiUtils.buildSuccessResponse("Group notification deleted successfully");
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<?> getAllGroupNotifications(
            @RequestParam(required = false) String cursor
    ) {
        var result = notificationGroupService.getAllGroupNotifications(cursor);
        return ApiUtils.buildSuccessResponse(result);
    }
}
