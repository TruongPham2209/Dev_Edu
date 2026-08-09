package com.pht.dev_edu.notification.controller;

import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.notification.dto.NotificationCategory;
import com.pht.dev_edu.notification.service.NotificationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController("NotificationController")
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationController {

    NotificationService notificationService;

    // Get notification by cursor
    @GetMapping
    public ResponseEntity<?> getNotifications(
            @RequestParam(required = false) String cursor) {
        var username = SecurityContextUtils.getCurrentUsernameForController();
        var userRoles = SecurityContextUtils.getCurrentUserAuthorities();

        var result = notificationService.getUnifiedNotifications(username, userRoles, cursor);
        return ApiUtils.buildSuccessResponse(result);
    }

    // Get unread count
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount() {
        var username = SecurityContextUtils.getCurrentUsernameForController();
        var userRoles = SecurityContextUtils.getCurrentUserAuthorities();

        var result = notificationService.getUnreadNotificationCounts(username, userRoles);
        return ApiUtils.buildSuccessResponse(result);
    }

    // Mark as read by ID or mark all as read
    @PutMapping("/read")
    public ResponseEntity<?> markAsRead(
            @RequestParam(required = false) UUID id,
            @RequestParam(required = false, defaultValue = "PERSONAL") NotificationCategory category) {
        var username = SecurityContextUtils.getCurrentUsernameForController();
        if (id != null) {
            notificationService.markNotificationAsRead(id, category, username);
        } else {
            var userRoles = SecurityContextUtils.getCurrentUserAuthorities();
            notificationService.markAllNotificationsAsRead(username, userRoles);
        }

        return ApiUtils.buildSuccessResponse("Notification marked as read successfully");
    }
}
