package com.pht.dev_edu.common.constant;

import java.util.ArrayList;
import java.util.List;

public class WebEndpointConstant {
    public static final List<String> PERMIT_ALL_MATCHERS = new ArrayList<>();
    public static final List<String> CSRF_IGNORING_MATCHERS = new ArrayList<>();

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
    }
}
