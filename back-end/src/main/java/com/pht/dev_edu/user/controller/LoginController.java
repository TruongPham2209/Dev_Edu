package com.pht.dev_edu.user.controller;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.user.dto.RegisterUser;
import com.pht.dev_edu.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class LoginController {
    UserService userService;

    @PostMapping("/users/change-password")
    public ResponseEntity<ApiResponse> changePassword(@RequestBody Map<String, String> request) {
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        if (!StringUtils.hasText(oldPassword) || !StringUtils.hasText(newPassword)) {
            throw new IllegalArgumentException("Mật khẩu cũ và mật khẩu mới không được để trống.");
        }

        String username = SecurityContextUtils.getCurrentUsernameForController();
        userService.changePassword(username, oldPassword, newPassword);
        return ApiUtils.buildSuccessResponse("Mật khẩu đã được thay đổi thành công.");
    }

    @PreAuthorize("permitAll()")
    @PostMapping("/users/register")
    public ResponseEntity<ApiResponse> registerUser(@Valid @RequestBody RegisterUser registerUser) {
        registerUser.setRole(RoleEnum.STUDENT);
        userService.registerUser(registerUser);
        return ApiUtils.buildSuccessResponse("Đăng ký thành công.");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/users/batch-users")
    public ResponseEntity<ApiResponse> batchCreateUsers(@RequestBody List<@Valid RegisterUser> registerUsers) {
        userService.batchRegisterUsers(registerUsers);
        return ApiUtils.buildSuccessResponse("Tạo người dùng hàng loạt thành công.");
    }

    @PutMapping("/users/avatar")
    public ResponseEntity<ApiResponse> updateAvatar(@RequestBody Map<String, String> request) {
        String avatarObjectKey = request.get("avatarObjectKey");
        if (!StringUtils.hasText(avatarObjectKey)) {
            throw new IllegalArgumentException("avatarObjectKey không được để trống.");
        }

        String username = SecurityContextUtils.getCurrentUsernameForController();
        String newAvatarUrl = userService.updateAvatar(username, avatarObjectKey);
        return ApiUtils.buildSuccessResponse(newAvatarUrl);
    }

    // TODO: set username after login with google, email get from jwt instead of request body
    @PutMapping("/users/username")
    public ResponseEntity<ApiResponse> setUsernameForGoogleLogin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String username = request.get("username");

        if (!StringUtils.hasText(email) || !StringUtils.hasText(username)) {
            throw new IllegalArgumentException("Email và username không được để trống.");
        }

        userService.setUsernameForGoogleLogin(email, username);
        return ApiUtils.buildSuccessResponse("Username đã được cập nhật thành công.");
    }
}
