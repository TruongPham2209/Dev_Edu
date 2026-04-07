package com.pht.dev_edu.common.security;

import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2AccessTokenAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.context.AuthorizationServerContextHolder;
import org.springframework.security.oauth2.server.authorization.token.DefaultOAuth2TokenContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenGenerator;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;

import static com.pht.dev_edu.common.security.OAuth2PasswordGrantAuthenticationConverter.PASSWORD_GRANT_TYPE;

@Slf4j
@Component
public class OAuth2PasswordGrantAuthenticationProvider implements AuthenticationProvider {
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final OAuth2AuthorizationService authorizationService;
    private final OAuth2TokenGenerator<? extends OAuth2Token> tokenGenerator;

    public OAuth2PasswordGrantAuthenticationProvider(UserDetailsService userDetailsService,
                                                     PasswordEncoder passwordEncoder,
                                                     OAuth2AuthorizationService authorizationService,
                                                     OAuth2TokenGenerator<? extends OAuth2Token> tokenGenerator) {
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
        this.authorizationService = authorizationService;
        this.tokenGenerator = tokenGenerator;
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        OAuth2PasswordGrantAuthenticationToken passwordGrantAuthenticationToken =
                (OAuth2PasswordGrantAuthenticationToken) authentication;

        // Ensure the client is authenticated
        OAuth2ClientAuthenticationToken clientPrincipal =
                getAuthenticatedClientElseThrowInvalidClient(passwordGrantAuthenticationToken);
        RegisteredClient registeredClient = clientPrincipal.getRegisteredClient();

        // Check if client supports password grant type
        if (registeredClient == null || !registeredClient.getAuthorizationGrantTypes().contains(passwordGrantAuthenticationToken.getGrantType())) {
            throw new OAuth2AuthenticationException(OAuth2ErrorCodes.UNAUTHORIZED_CLIENT);
        }

        // Validate scopes
        Set<String> authorizedScopes = getAuthorizedScopes(passwordGrantAuthenticationToken, registeredClient);

        // Verify user credentials
        if (log.isDebugEnabled()) {
            log.debug("Checking user credentials");
        }

        String providedUsername = passwordGrantAuthenticationToken.getUsername();
        String providedPassword = passwordGrantAuthenticationToken.getPassword();
        UserDetails userDetails = null;
        try {
            userDetails = this.userDetailsService.loadUserByUsername(providedUsername);
        } catch (Exception ex) {
            OAuth2Error error = new OAuth2Error("bad_credentials", "Sai tên đăng nhập hoặc mật khẩu", null);
            throw new OAuth2AuthenticationException(error);
        }

        if (!userDetails.isAccountNonLocked()) {
            OAuth2Error error = new OAuth2Error("account_locked", "Tài khoản đã bị khóa", null);
            throw new OAuth2AuthenticationException(error);
        }
        if (!userDetails.isEnabled()) {
            OAuth2Error error = new OAuth2Error("account_disabled", "Tài khoản đã bị vô hiệu hóa", null);
            throw new OAuth2AuthenticationException(error);
        }
        if (!userDetails.isAccountNonExpired()) {
            OAuth2Error error = new OAuth2Error("account_expired", "Tài khoản đã hết hạn", null);
            throw new OAuth2AuthenticationException(error);
        }
        if (!userDetails.isCredentialsNonExpired()) {
            OAuth2Error error = new OAuth2Error("credentials_expired", "Thông tin đăng nhập đã hết hạn", null);
            throw new OAuth2AuthenticationException(error);
        }

        if (!this.passwordEncoder.matches(providedPassword, userDetails.getPassword())) {
            OAuth2Error error = new OAuth2Error("bad_credentials", "Sai tên đăng nhập hoặc mật khẩu", null);
            throw new OAuth2AuthenticationException(error);
        }

        var userPrincipal = new UsernamePasswordAuthenticationToken(userDetails, providedPassword, userDetails.getAuthorities());

        if (log.isDebugEnabled()) {
            log.debug("Generating tokens");
        }

        // Generate access token
        OAuth2AccessToken accessToken = generateAccessToken(registeredClient, userPrincipal, authorizedScopes, passwordGrantAuthenticationToken);

        // Generate refresh token (if client supports refresh token grant)
        OAuth2RefreshToken refreshToken = null;
        if (registeredClient.getAuthorizationGrantTypes().contains(AuthorizationGrantType.REFRESH_TOKEN)) {
            refreshToken = generateRefreshToken(registeredClient, userPrincipal, passwordGrantAuthenticationToken);
        }

        // Generate ID token (if openid scope is requested)
        OidcIdToken idToken = null;
        Map<String, Object> additionalParameters = new HashMap<>();
        if (authorizedScopes.contains(OidcScopes.OPENID)) {
            idToken = generateIdToken(registeredClient, userPrincipal, authorizedScopes, passwordGrantAuthenticationToken);
            if (idToken != null) {
                additionalParameters.put("id_token", idToken.getTokenValue());
            }
            log.info("Addition Param: {}", additionalParameters);
        }

        // Build token metadata
        Map<String, Object> tokenMetadata = buildTokenMetadata(userDetails, authorizedScopes);

        // Create and save authorization
        OAuth2Authorization.Builder authorizationBuilder = OAuth2Authorization.withRegisteredClient(registeredClient)
                .principalName(userDetails.getUsername())
                .authorizationGrantType(PASSWORD_GRANT_TYPE)
                .authorizedScopes(authorizedScopes)
                .attribute(Principal.class.getName(), userPrincipal)
                .token(accessToken, (metadata) -> metadata.put(OAuth2Authorization.Token.CLAIMS_METADATA_NAME, tokenMetadata));

        if (refreshToken != null) {
            authorizationBuilder.refreshToken(refreshToken);
        }

        if (idToken != null) {
            authorizationBuilder.token(idToken, (metadata) ->
                    metadata.put(OAuth2Authorization.Token.CLAIMS_METADATA_NAME, tokenMetadata));
        }

        OAuth2Authorization authorization = authorizationBuilder.build();

        if (log.isDebugEnabled()) {
            log.debug("Saving authorization");
        }

        this.authorizationService.save(authorization);

        // Return authentication token with all generated tokens
        return new OAuth2AccessTokenAuthenticationToken(
                registeredClient,
                clientPrincipal,
                accessToken,
                refreshToken,
                additionalParameters
        );
    }

    private OAuth2AccessToken generateAccessToken(RegisteredClient registeredClient,
                                                  Authentication userPrincipal,
                                                  Set<String> authorizedScopes,
                                                  OAuth2PasswordGrantAuthenticationToken passwordGrantAuthentication) {

        OAuth2TokenContext tokenContext = DefaultOAuth2TokenContext.builder()
                .registeredClient(registeredClient)
                .principal(userPrincipal)
                .authorizationServerContext(AuthorizationServerContextHolder.getContext())
                .authorizedScopes(authorizedScopes)
                .tokenType(OAuth2TokenType.ACCESS_TOKEN)
                .authorizationGrantType(PASSWORD_GRANT_TYPE)
                .authorizationGrant(passwordGrantAuthentication)
                .put("roles", userPrincipal.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority).collect(Collectors.toSet()))
                .build();

        OAuth2Token generatedAccessToken = this.tokenGenerator.generate(tokenContext);
        if (generatedAccessToken == null) {
            OAuth2Error error = new OAuth2Error(OAuth2ErrorCodes.SERVER_ERROR,
                    "The token generator failed to generate the access token.", "ACCESS_TOKEN_REQUEST_ERROR_URI");
            throw new OAuth2AuthenticationException(error);
        }

        return new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER,
                generatedAccessToken.getTokenValue(),
                generatedAccessToken.getIssuedAt(),
                generatedAccessToken.getExpiresAt(),
                authorizedScopes
        );
    }

    private OAuth2RefreshToken generateRefreshToken(RegisteredClient registeredClient,
                                                    Authentication userPrincipal,
                                                    OAuth2PasswordGrantAuthenticationToken passwordGrantAuthentication) {

        OAuth2TokenContext tokenContext = DefaultOAuth2TokenContext.builder()
                .registeredClient(registeredClient)
                .principal(userPrincipal)
                .authorizationServerContext(AuthorizationServerContextHolder.getContext())
                .tokenType(OAuth2TokenType.REFRESH_TOKEN)
                .authorizationGrantType(PASSWORD_GRANT_TYPE)
                .authorizationGrant(passwordGrantAuthentication)
                .build();

        OAuth2Token generatedRefreshToken = this.tokenGenerator.generate(tokenContext);
        if (generatedRefreshToken == null) {
            log.debug("Refresh token generation failed or not supported");
            return null;
        }

        return new OAuth2RefreshToken(
                generatedRefreshToken.getTokenValue(),
                generatedRefreshToken.getIssuedAt(),
                generatedRefreshToken.getExpiresAt()
        );
    }

    private OidcIdToken generateIdToken(RegisteredClient registeredClient,
                                        Authentication userPrincipal,
                                        Set<String> authorizedScopes,
                                        OAuth2PasswordGrantAuthenticationToken passwordGrantAuthentication) {

        OAuth2TokenContext tokenContext = DefaultOAuth2TokenContext.builder()
                .registeredClient(registeredClient)
                .principal(userPrincipal)
                .authorizationServerContext(AuthorizationServerContextHolder.getContext())
                .authorizedScopes(authorizedScopes)
                .tokenType(new OAuth2TokenType("id_token")) // Custom token type for ID token
                .authorizationGrantType(PASSWORD_GRANT_TYPE)
                .authorizationGrant(passwordGrantAuthentication)
                .put("roles", userPrincipal.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority).collect(Collectors.toSet()))
                .build();

        OAuth2Token generatedIdToken = this.tokenGenerator.generate(tokenContext);
        if (generatedIdToken == null) {
            log.debug("ID token generation failed or not supported");
            return null;
        }

        // Build additional claims for ID token
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", userPrincipal.getName());
        claims.put("preferred_username", userPrincipal.getName());

        // Add profile claims if profile scope is requested
        if (authorizedScopes.contains(OidcScopes.PROFILE)) {
            // You can add more profile claims here
            claims.put("name", userPrincipal.getName());
        }

        return new OidcIdToken(
                generatedIdToken.getTokenValue(),
                generatedIdToken.getIssuedAt(),
                generatedIdToken.getExpiresAt(),
                claims
        );
    }

    private Map<String, Object> buildTokenMetadata(UserDetails userDetails, Set<String> authorizedScopes) {
        Map<String, Object> tokenMetadata = new HashMap<>();
        tokenMetadata.put("username", userDetails.getUsername());
        tokenMetadata.put("roles", userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).collect(Collectors.toSet()));
        if (!authorizedScopes.isEmpty()) {
            tokenMetadata.put("scopes", authorizedScopes);
        }
        return tokenMetadata;
    }

    private Set<String> getAuthorizedScopes(OAuth2PasswordGrantAuthenticationToken passwordGrantAuthenticationToken,
                                            RegisteredClient registeredClient) {
        Set<String> requestedScopes = passwordGrantAuthenticationToken.getScopes();
        if (requestedScopes == null || requestedScopes.isEmpty()) {
            return Collections.emptySet();
        }

        Set<String> authorizedScopes = new LinkedHashSet<>();
        for (String requestedScope : requestedScopes) {
            if (!registeredClient.getScopes().contains(requestedScope)) {
                throw new OAuth2AuthenticationException(OAuth2ErrorCodes.INVALID_SCOPE);
            }
            authorizedScopes.add(requestedScope);
        }
        return authorizedScopes;
    }

    @Override
    public boolean supports(@NotNull Class<?> authentication) {
        return OAuth2PasswordGrantAuthenticationToken.class.isAssignableFrom(authentication);
    }

    private static OAuth2ClientAuthenticationToken getAuthenticatedClientElseThrowInvalidClient(Authentication authentication) {
        OAuth2ClientAuthenticationToken clientPrincipal = null;
        if (OAuth2ClientAuthenticationToken.class.isAssignableFrom(Objects.requireNonNull(authentication.getPrincipal()).getClass())) {
            clientPrincipal = (OAuth2ClientAuthenticationToken) authentication.getPrincipal();
        }
        if (clientPrincipal != null && clientPrincipal.isAuthenticated()) {
            return clientPrincipal;
        }
        throw new OAuth2AuthenticationException(OAuth2ErrorCodes.INVALID_CLIENT);
    }
}