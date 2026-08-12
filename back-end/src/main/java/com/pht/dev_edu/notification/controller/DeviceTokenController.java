package com.pht.dev_edu.notification.controller;

import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.notification.dto.RegisterDeviceTokenRequest;
import com.pht.dev_edu.notification.dto.UnregisterDeviceTokenRequest;
import com.pht.dev_edu.notification.service.DeviceTokenService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController("DeviceTokenController")
@RequestMapping("/api/v1/notifications/device-tokens")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DeviceTokenController {

    DeviceTokenService deviceTokenService;

    @PostMapping
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterDeviceTokenRequest request,
            @RequestHeader(value = "User-Agent", required = false) String userAgent) {

        String username = SecurityContextUtils.getCurrentUsernameForController();
        deviceTokenService.register(
                username,
                request.getFcmToken(),
                request.getDeviceType(),
                userAgent
        );
        return ApiUtils.buildSuccessResponse("Device token registered successfully");
    }

    @DeleteMapping
    public ResponseEntity<?> unregister(
            @Valid @RequestBody UnregisterDeviceTokenRequest request) {

        String username = SecurityContextUtils.getCurrentUsernameForController();
        deviceTokenService.unregister(username, request.getFcmToken());
        return ApiUtils.buildSuccessResponse("Device token unregistered successfully");
    }
}
