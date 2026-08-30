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

/**
 * Utility class for inspecting and extracting authentication credentials, usernames, and role authorities from {@link SecurityContextHolder}.
 */
public class SecurityContextUtils {

    /**
     * Retrieves the username of the currently authenticated user for controllers, throwing {@link UnauthorizedException} if unauthenticated.
     *
     * @return the authenticated username.
     * @throws UnauthorizedException if no authenticated user session exists.
     */
    public static String getCurrentUsernameForController() {
        String username = SecurityContextUtils.getCurrentUsername();
        if (username == null) {
            throw new UnauthorizedException("Please login to access this resource");
        }
        return username;
    }

    /**
     * Retrieves the current username from the default Spring Security context.
     *
     * @return the username string or null if unauthenticated.
     */
    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return getCurrentUsername(authentication);
    }

    /**
     * Extracts the username from the given {@link Authentication} token.
     * Supports {@link UserDetails}, OAuth2 {@link Jwt}, and principal string.
     *
     * @param authentication the Spring Security authentication token.
     * @return the resolved username or null if anonymous/invalid.
     */
    public static String getCurrentUsername(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            return null;
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

    /**
     * Retrieves the set of granted authority strings for the currently authenticated user.
     *
     * @return the set of authority strings.
     */
    public static Set<String> getCurrentUserAuthorities() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return getCurrentUserAuthorities(authentication);
    }

    /**
     * Extracts granted authorities from the given {@link Authentication} object.
     *
     * @param authentication the authentication token.
     * @return the set of authority strings.
     */
    public static Set<String> getCurrentUserAuthorities(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            return Set.of();
        }

        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(java.util.stream.Collectors.toSet());
    }

    /**
     * Maps authority string names (e.g. "ROLE_ADMIN", "ADMIN") to their corresponding {@link RoleEnum} values.
     *
     * @param authorities the collection of authority strings.
     * @return the set of parsed {@link RoleEnum} values.
     */
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

    /**
     * Retrieves the set of {@link RoleEnum} roles belonging to the current authenticated user.
     *
     * @return the set of {@link RoleEnum} roles.
     */
    public static Set<RoleEnum> getCurrentUserRoleEnums() {
        return extractRoleEnums(getCurrentUserAuthorities());
    }
}
