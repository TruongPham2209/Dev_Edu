package com.pht.dev_edu.common.constant;

import java.util.ArrayList;
import java.util.List;

public class WebEndpointConstant {
    public static final List<String> PERMIT_ALL_MATCHERS = new ArrayList<>();
    public static final List<String> CSRF_IGNORING_MATCHERS = new ArrayList<>();
    public static final List<String> GET_PERMIT_ALL_ENDPOINTS = new ArrayList<>();

    static {
        CSRF_IGNORING_MATCHERS.addAll(List.of(
                "/login", "/favicon.ico", "/css/**", "/js/**", "/images/**",
                "/oauth2/**", "/.well-known/**",
                "/api/v1/**"
        ));

        PERMIT_ALL_MATCHERS.addAll(List.of(
                "/login", "/oauth2/authorize",
                "/favicon.ico", "/.well-known/**",
                "/css/**", "/js/**", "/images/**",
                "/actuator/**"
        ));

        GET_PERMIT_ALL_ENDPOINTS.addAll(List.of(
                "/api/v1/categories",
                "/api/v1/courses",
                "/api/v1/courses/**",
                "/api/v1/lectures",
                "/api/v1/courses/reviews",
                "/api/v1/users/register",
                "/api/v1/forum/posts",
                "/api/v1/forum/posts/**",
                "/api/v1/forum/comments",
                "/api/v1/forum/comments/replies"
        ));
    }
}
