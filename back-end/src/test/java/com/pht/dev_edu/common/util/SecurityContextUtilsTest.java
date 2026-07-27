package com.pht.dev_edu.common.util;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Collection;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.jwt.Jwt;

/*
 * <analysis>
 * SecurityContextUtils
 * - getCurrentUsernameForController()
 *   - branches:
 *       if getCurrentUsername() returns null -> throw UnauthorizedException
 *       else -> return username
 *   - paths:
 *       [P1: no authentication -> UnauthorizedException]
 *       [P2: valid authentication -> username returned]
 *   - planned tests:
 *       [shouldThrowUnauthorizedWhenNoAuthentication -> P1]
 *       [shouldReturnUsernameForController -> P2]
 *
 * - getCurrentUsername(Authentication)
 *   - branches:
 *       authentication == null -> return null
 *       !authentication.isAuthenticated() -> return null
 *       principal instanceof UserDetails -> return username
 *       principal instanceof String -> return string
 *       principal instanceof Jwt -> return sub claim
 *       else -> return null
 *   - paths:
 *       [P1: null auth -> null]
 *       [P2: not authenticated -> null]
 *       [P3: UserDetails principal -> username]
 *       [P4: String principal -> string]
 *       [P5: Jwt principal -> sub claim]
 *       [P6: unknown principal type -> null]
 *   - planned tests:
 *       [shouldReturnNullWhenAuthenticationIsNull -> P1]
 *       [shouldReturnNullWhenNotAuthenticated -> P2]
 *       [shouldReturnUsernameFromUserDetails -> P3]
 *       [shouldReturnUsernameFromString -> P4]
 *       [shouldReturnUsernameFromJwt -> P5]
 *       [shouldReturnNullForUnknownPrincipalType -> P6]
 *
 * - getCurrentUserAuthorities(Authentication)
 *   - branches:
 *       authentication == null -> return empty set
 *       !isAuthenticated -> return empty set
 *       else -> return set of authority strings
 *   - paths:
 *       [P1: null -> empty set]
 *       [P2: not authenticated -> empty set]
 *       [P3: authenticated with authorities -> set of strings]
 *   - planned tests:
 *       [shouldReturnEmptySetWhenAuthIsNull -> P1]
 *       [shouldReturnEmptySetWhenNotAuthenticated -> P2]
 *       [shouldReturnAuthorityStrings -> P3]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for SecurityContextUtils
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify security context extraction logic in SecurityContextUtils.
 *
 * Test Scope
 * ----------
 * - getCurrentUsernameForController()
 * - getCurrentUsername(Authentication)
 * - getCurrentUserAuthorities(Authentication)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Null/unauthenticated states
 * ✓ UserDetails, String, and Jwt principal types
 * ✓ Unknown principal type
 * ✓ Authority extraction
 * ✓ UnauthorizedException for controller method
 *
 * Mocked Dependencies
 * -------------------
 * - Authentication (Mockito mock)
 * - UserDetails (Mockito mock)
 * - Jwt (Mockito mock)
 * - SecurityContextHolder (static, set/cleared per test)
 *
 * Not Covered
 * -----------
 * - Spring Security filter chain integration
 *
 * Notes
 * -----
 * SecurityContextHolder is thread-local; tests set and clear it in setup/teardown.
 */

import com.pht.dev_edu.common.exception.security.UnauthorizedException;

class SecurityContextUtilsTest {

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // ==================== getCurrentUsername(Authentication) ====================

    @Test
    @DisplayName("getCurrentUsername - should return null when authentication is null")
    void shouldReturnNullWhenAuthenticationIsNull() {
        // Act
        String result = SecurityContextUtils.getCurrentUsername(null);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("getCurrentUsername - should return null when not authenticated")
    void shouldReturnNullWhenNotAuthenticated() {
        // Arrange
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(false);

        // Act
        String result = SecurityContextUtils.getCurrentUsername(auth);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("getCurrentUsername - should return username from UserDetails principal")
    void shouldReturnUsernameFromUserDetails() {
        // Arrange
        Authentication auth = mock(Authentication.class);
        UserDetails userDetails = mock(UserDetails.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("testuser");

        // Act
        String result = SecurityContextUtils.getCurrentUsername(auth);

        // Assert
        assertThat(result).isEqualTo("testuser");
    }

    @Test
    @DisplayName("getCurrentUsername - should return username from String principal")
    void shouldReturnUsernameFromString() {
        // Arrange
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn("string_user");

        // Act
        String result = SecurityContextUtils.getCurrentUsername(auth);

        // Assert
        assertThat(result).isEqualTo("string_user");
    }

    @Test
    @DisplayName("getCurrentUsername - should return sub claim from Jwt principal")
    void shouldReturnUsernameFromJwt() {
        // Arrange
        Authentication auth = mock(Authentication.class);
        Jwt jwt = mock(Jwt.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(jwt);
        when(jwt.getClaimAsString("sub")).thenReturn("jwt_user");

        // Act
        String result = SecurityContextUtils.getCurrentUsername(auth);

        // Assert
        assertThat(result).isEqualTo("jwt_user");
    }

    @Test
    @DisplayName("getCurrentUsername - should return null for unknown principal type")
    void shouldReturnNullForUnknownPrincipalType() {
        // Arrange
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(12345); // Integer — unknown type

        // Act
        String result = SecurityContextUtils.getCurrentUsername(auth);

        // Assert
        assertThat(result).isNull();
    }

    // ==================== getCurrentUsernameForController ====================

    @Test
    @DisplayName("getCurrentUsernameForController - should throw UnauthorizedException when no authentication")
    void shouldThrowUnauthorizedWhenNoAuthentication() {
        // Arrange — empty security context (no auth)
        SecurityContextHolder.setContext(new SecurityContextImpl());

        // Act & Assert
        assertThatThrownBy(SecurityContextUtils::getCurrentUsernameForController)
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Please login to access this resource");
    }

    @Test
    @DisplayName("getCurrentUsernameForController - should return username when authenticated")
    void shouldReturnUsernameForController() {
        // Arrange
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn("controller_user");

        SecurityContextImpl context = new SecurityContextImpl();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);

        // Act
        String result = SecurityContextUtils.getCurrentUsernameForController();

        // Assert
        assertThat(result).isEqualTo("controller_user");
    }

    // ==================== getCurrentUserAuthorities ====================

    @Test
    @DisplayName("getCurrentUserAuthorities - should return empty set when auth is null")
    void shouldReturnEmptySetWhenAuthIsNull() {
        // Act
        Set<String> result = SecurityContextUtils.getCurrentUserAuthorities(null);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getCurrentUserAuthorities - should return empty set when not authenticated")
    void shouldReturnEmptySetWhenNotAuthenticated() {
        // Arrange
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(false);

        // Act
        Set<String> result = SecurityContextUtils.getCurrentUserAuthorities(auth);

        // Assert
        assertThat(result).isEmpty();
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("getCurrentUserAuthorities - should return authority strings when authenticated")
    void shouldReturnAuthorityStrings() {
        // Arrange
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        var authorities = List.of(
                new SimpleGrantedAuthority("ROLE_ADMIN"),
                new SimpleGrantedAuthority("ROLE_LECTURER"));
        when(auth.getAuthorities()).thenReturn((Collection) authorities);

        // Act
        Set<String> result = SecurityContextUtils.getCurrentUserAuthorities(auth);

        // Assert
        assertThat(result).containsExactlyInAnyOrder("ROLE_ADMIN", "ROLE_LECTURER");
    }
}
