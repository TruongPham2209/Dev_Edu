package com.pht.dev_edu.common.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.jetbrains.annotations.NotNull;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthFailureHandler implements AuthenticationFailureHandler {
    @Override
    public void onAuthenticationFailure(@NotNull HttpServletRequest request, @NotNull HttpServletResponse response, @NotNull AuthenticationException exception) throws IOException, ServletException {

        String errorMessage = "Login failed.";

        if (exception instanceof LockedException) {
            errorMessage = "Account is locked";
        } else if (exception instanceof DisabledException) {
            errorMessage = "Account is disabled";
        } else if (exception instanceof CredentialsExpiredException) {
            errorMessage = "Credentials have expired";
        } else if (exception instanceof AccountExpiredException) {
            errorMessage = "Account has expired";
        } else if (exception instanceof BadCredentialsException) {
            errorMessage = "Invalid username or password";
        }

        // set attribute vào session
        request.getSession().setAttribute("errorMessage", errorMessage);

        // redirect về trang login
        response.sendRedirect("/login?error");
    }
}
