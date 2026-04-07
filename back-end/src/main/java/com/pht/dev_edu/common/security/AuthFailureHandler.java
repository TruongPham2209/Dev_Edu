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

        String errorMessage = "Thông tin đăng nhập không đúng";

        if (exception instanceof LockedException) {
            errorMessage = "Tài khoản đã bị khóa";
        } else if (exception instanceof DisabledException) {
            errorMessage = "Tài khoản đã bị vô hiệu hóa";
        } else if (exception instanceof CredentialsExpiredException) {
            errorMessage = "Mật khẩu đã hết hạn";
        } else if (exception instanceof AccountExpiredException) {
            errorMessage = "Tài khoản đã hết hạn";
        } else if (exception instanceof BadCredentialsException) {
            errorMessage = "Sai thông tin đăng nhập.";
        }

        // set attribute vào session
        request.getSession().setAttribute("errorMessage", errorMessage);

        // redirect về trang login
        response.sendRedirect("/login?error");
    }
}
