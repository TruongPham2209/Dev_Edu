package com.pht.dev_edu.common.security;

import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.tracking.dto.RequestLoggingEvent;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.io.UnsupportedEncodingException;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LoggingSecurityFilter extends OncePerRequestFilter {
    KafkaTemplate<String, Object> kafkaTemplate;

    private static final int MAX_PAYLOAD_LENGTH = 1024 * 1024; // 1MB

    @Override
    protected void doFilterInternal(@NotNull HttpServletRequest request, @NotNull HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        ContentCachingRequestWrapper wrappedRequest =
                new ContentCachingRequestWrapper(request, MAX_PAYLOAD_LENGTH);

        ContentCachingResponseWrapper wrappedResponse =
                new ContentCachingResponseWrapper(response);

        // ❗ PHẢI truyền wrapper vào chain
        filterChain.doFilter(wrappedRequest, wrappedResponse);

        String uri = request.getRequestURI();
        log.info("Handling request: {} {}", request.getMethod(), uri);

        if (!uri.startsWith("/api")) {
            wrappedResponse.copyBodyToResponse(); // ❗ cực quan trọng
            return;
        }

        RequestLoggingEvent event = getEvent(wrappedRequest, wrappedResponse, uri);

        kafkaTemplate.send(KafkaTopicConstant.REQUEST_LOG_TOPIC, event);

        // ❗ QUAN TRỌNG: trả response về client
        wrappedResponse.copyBodyToResponse();
    }

    private static RequestLoggingEvent getEvent(ContentCachingRequestWrapper request, ContentCachingResponseWrapper response, String uri) throws UnsupportedEncodingException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String user = (auth != null) ? auth.getName() : "anonymous";

        String requestBody = "";
        String responseBody = "";

        // 👉 Request body
        if ("POST".equals(request.getMethod()) || "PUT".equals(request.getMethod())) {
            byte[] content = request.getContentAsByteArray();
            if (content.length > 0) {
                request.getCharacterEncoding();
                requestBody = new String(
                        content,
                        request.getCharacterEncoding()
                );
            }

            boolean truncated = content.length >= MAX_PAYLOAD_LENGTH;
            if (truncated) {
                requestBody += "...[TRUNCATED]";
            }
        }

        // 👉 Response body
        byte[] responseContent = response.getContentAsByteArray();
        if (responseContent.length > 0) {
            responseBody = new String(
                    responseContent,
                    response.getCharacterEncoding() != null ? response.getCharacterEncoding() : "UTF-8"
            );
        }

        return RequestLoggingEvent.builder()
                .username(user)
                .method(request.getMethod())
                .uri(uri)
                .requestBody(requestBody)
                .responseBody(responseBody)
                .build();
    }
}
