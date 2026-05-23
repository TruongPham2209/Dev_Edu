package com.pht.dev_edu.user.controller;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.user.dto.UserInfoResponse;
import com.pht.dev_edu.user.entity.RoleEntity;
import com.pht.dev_edu.user.service.ProfileService;
import com.pht.dev_edu.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController("ProfileController")
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ProfileController {
    UserService userService;
    ProfileService profileService;

    @PostMapping("/users/change-password")
    public ResponseEntity<ApiResponse> changePassword(@RequestBody Map<String, String> request) {
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        if (!StringUtils.hasText(oldPassword) || !StringUtils.hasText(newPassword)) {
            throw new BadRequestException("New password cannot match old password.");
        }

        String username = SecurityContextUtils.getCurrentUsernameForController();
        profileService.changePassword(username, oldPassword, newPassword);
        return ApiUtils.buildSuccessResponse("Change password successful.");
    }

    @PutMapping("/users/avatar")
    public ResponseEntity<ApiResponse> updateAvatar(@RequestBody Map<String, String> request) {
        String avatarObjectKey = request.get("avatarObjectKey");
        if (!StringUtils.hasText(avatarObjectKey)) {
            throw new BadRequestException("Missing required field.");
        }

        String username = SecurityContextUtils.getCurrentUsernameForController();
        String newAvatarUrl = profileService.updateAvatar(username, avatarObjectKey);
        return ApiUtils.buildSuccessResponse(newAvatarUrl);
    }

    // TODO: set username after login with Google, email get from jwt instead of request body
    @PutMapping("/users/username")
    public ResponseEntity<ApiResponse> setUsernameForGoogleLogin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String username = request.get("username");

        if (!StringUtils.hasText(email) || !StringUtils.hasText(username)) {
            throw new BadRequestException("Email or username missing.");
        }

        profileService.setUsernameForGoogleLogin(email, username);
        return ApiUtils.buildSuccessResponse("Username đã được cập nhật thành công.");
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse> getCurrentUser() {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        var userInfo = userService.findByUsername(username);

        var info = UserInfoResponse.builder()
                .id(userInfo.getId())
                .username(userInfo.getUsername())
                .email(userInfo.getEmail())
                .fullName(userInfo.getFullName())
                .avatarUrl(userInfo.getAvatarUrl())
                .role(userInfo.getRoles().stream().findFirst().map(RoleEntity::getName).orElse(RoleEnum.STUDENT))
                .build();

        return ApiUtils.buildSuccessResponse(info);
    }
}
