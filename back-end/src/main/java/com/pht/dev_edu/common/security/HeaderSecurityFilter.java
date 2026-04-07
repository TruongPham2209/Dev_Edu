package com.pht.dev_edu.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class HeaderSecurityFilter  extends OncePerRequestFilter {
//    SharedServiceProperty sharedServiceProperty;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String uri = request.getRequestURI();
        log.info("Handling request: {} {}", request.getMethod(), uri);

        if (!uri.startsWith("/api")) {
            log.info("Skipping non-API request: {}", uri);
            filterChain.doFilter(request, response);
            return;
        }

//        String username = request.getHeader(HeaderSecurityConstant.HEADER_USERNAME);
//        String roles = request.getHeader(HeaderSecurityConstant.HEADER_ROLES);
//        String signature = request.getHeader(HeaderSecurityConstant.HEADER_SIGNATURE);
//        String timestampStr = request.getHeader(HeaderSecurityConstant.HEADER_TIMESTAMP);
//        Long timestamp = null;
//
//        if (!StringUtils.hasText(username) || !StringUtils.hasText(roles) || !StringUtils.hasText(signature)) {
//            log.error("Missing authentication headers");
//            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//            return;
//        }
//
//        try {
//            timestamp = Long.parseLong(timestampStr);
//        } catch (NumberFormatException e) {
//            log.error("Invalid timestamp format");
//            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//            return;
//        }
//
//        if (timestamp == 0 || System.currentTimeMillis() > timestamp) {
//            log.error("Request has expired");
//            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//            return;
//        }
//
//        String data = username + "|" + roles + "|" + timestamp;
//        try {
//            boolean isValidSignature = SignatureUtil.verifySignature(data, signature, sharedServiceProperty.getSecretKey());
//            if (!isValidSignature) {
//                log.error("Invalid signature");
//                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//                return;
//            }
//        }
//        catch (InvalidKeyException | NoSuchAlgorithmException e) {
//            log.error("Error verifying signature", e);
//            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
//            return;
//        }
//
//        List<GrantedAuthority> authorities = Arrays.stream(roles.split(","))
//                .map(SimpleGrantedAuthority::new)
//                .collect(Collectors.toList());
//
//        UsernamePasswordAuthenticationToken authentication =
//                new UsernamePasswordAuthenticationToken(username, null, authorities);
//
//        SecurityContextHolder.getContext().setAuthentication(authentication);
//
//        log.info("Authentication successful for user: {}", username);
        filterChain.doFilter(request, response);
    }
}
