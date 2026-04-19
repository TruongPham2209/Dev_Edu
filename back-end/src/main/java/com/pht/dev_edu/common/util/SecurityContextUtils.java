package com.pht.dev_edu.common.util;

import com.pht.dev_edu.common.exception.security.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Set;

public class SecurityContextUtils {
    public static String getCurrentUsernameForController() {
        String username = SecurityContextUtils.getCurrentUsername();
        if (username == null) {
            throw new UnauthorizedException("Vui lòng đăng nhập để thực hiện thao tác này.");
        }
        return username;
    }

    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return getCurrentUsername(authentication);
    }


    public static String getCurrentUsername(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null; // hoặc throw exception tuỳ nhu cầu
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            return (String) principal;
        }

        return null;
    }

    public static Set<String> getCurrentUserAuthorities() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return getCurrentUserAuthorities(authentication);
    }

    public static Set<String> getCurrentUserAuthorities(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return Set.of(); // hoặc throw exception tuỳ nhu cầu
        }

        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(java.util.stream.Collectors.toSet());
    }
}
