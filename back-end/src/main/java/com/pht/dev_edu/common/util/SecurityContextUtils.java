package com.pht.dev_edu.common.util;

import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.security.UnauthorizedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.util.CollectionUtils;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

public class SecurityContextUtils {
    public static String getCurrentUsernameForController() {
        String username = SecurityContextUtils.getCurrentUsername();
        if (username == null) {
            throw new UnauthorizedException("Please login to access this resource");
        }
        return username;
    }

    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return getCurrentUsername(authentication);
    }

    public static String getCurrentUsername(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            return null; // hoặc throw exception tuỳ nhu cầu
        }

        Object principal = authentication.getPrincipal();
        if (principal == null || "anonymousUser".equalsIgnoreCase(String.valueOf(principal))) {
            return null;
        }

        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        } else if (principal instanceof Jwt jwt) {
            return jwt.getClaimAsString("sub");
        } else if (principal instanceof String username) {
            return username;
        }

        return null;
    }

    public static Set<String> getCurrentUserAuthorities() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return getCurrentUserAuthorities(authentication);
    }

    public static Set<String> getCurrentUserAuthorities(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            return Set.of(); // hoặc throw exception tuỳ nhu cầu
        }

        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(java.util.stream.Collectors.toSet());
    }

    public static Set<RoleEnum> extractRoleEnums(Collection<String> authorities) {
        if (CollectionUtils.isEmpty(authorities)) {
            return Set.of();
        }
        Set<RoleEnum> roles = new HashSet<>();
        for (String auth : authorities) {
            if (auth == null) continue;
            String clean = auth.startsWith("ROLE_") ? auth.substring(5) : auth;
            try {
                roles.add(RoleEnum.valueOf(clean));
            } catch (IllegalArgumentException ignored) {
                // Ignore non-RoleEnum values like SCOPE_openid, SCOPE_profile
            }
        }
        return roles;
    }

    public static Set<RoleEnum> getCurrentUserRoleEnums() {
        return extractRoleEnums(getCurrentUserAuthorities());
    }
}

