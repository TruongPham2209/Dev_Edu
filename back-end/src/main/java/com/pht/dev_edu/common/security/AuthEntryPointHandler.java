package com.pht.dev_edu.common.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
public class AuthEntryPointHandler implements AuthenticationEntryPoint {

    // Delegate entry point to continue the flow after request is not authenticated
    private final String loginPageUrl = "/login";
    private final AuthenticationEntryPoint delegate = new LoginUrlAuthenticationEntryPoint(loginPageUrl);

    @Override
    public void commence(@NotNull HttpServletRequest request, @NotNull HttpServletResponse response,
                         @NotNull AuthenticationException authException) throws IOException, ServletException {
        log.error("Redirect to login page: {}", authException.getMessage(), authException);
        this.delegate.commence(request, response, authException);
    }
}