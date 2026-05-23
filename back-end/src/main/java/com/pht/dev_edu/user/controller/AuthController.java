package com.pht.dev_edu.user.controller;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.user.dto.RegisterUser;
import com.pht.dev_edu.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController("AuthController")
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AuthController {
    UserService userService;

    @PreAuthorize("permitAll()")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerUser(@Valid @RequestBody RegisterUser registerUser) {
        registerUser.setRole(RoleEnum.STUDENT);
        userService.registerUser(registerUser);
        return ApiUtils.buildSuccessResponse("Register successful. Please login to continue.");
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/batch-users")
    public ResponseEntity<ApiResponse> batchCreateUsers(@RequestBody List<@Valid RegisterUser> registerUsers) {
        userService.batchRegisterUsers(registerUsers);
        return ApiUtils.buildSuccessResponse("Create users successful.");
    }
}
