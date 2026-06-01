package com.pht.dev_edu.user.controller;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.PagingUtils;
import com.pht.dev_edu.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController("UserController")
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    UserService userService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse> getUsers(
            @RequestParam int page,
            @RequestParam RoleEnum role,
            @RequestParam String keyword
    ) {
        int defaultUserPageSize = 15;
        var pageable = PagingUtils.getPageable(page + 1, defaultUserPageSize);

        var users = userService.searchUsers(keyword, role, pageable);
        return ApiUtils.buildSuccessResponse(users);
    }
}
