package com.pht.dev_edu.common.security;

import lombok.Getter;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2AuthorizationGrantAuthenticationToken;

import java.io.Serial;
import java.util.Set;

import static com.pht.dev_edu.common.security.OAuth2PasswordGrantAuthenticationConverter.PASSWORD_GRANT_TYPE;

@Getter
public class OAuth2PasswordGrantAuthenticationToken extends OAuth2AuthorizationGrantAuthenticationToken {
    @Serial
    private static final long serialVersionUID = 7840626509676504832L;

    private final String username;
    private final String password;
    private final String clientId;
    private final Set<String> scopes;


    public OAuth2PasswordGrantAuthenticationToken(String username, String password, Authentication clientPrincipal, Set<String> scopes) {
        super(PASSWORD_GRANT_TYPE, clientPrincipal, null);
        this.password = password;
        this.username = username;
        this.clientId = clientPrincipal.getName();
        this.scopes = scopes;
    }

}