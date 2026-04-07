package com.pht.dev_edu.common.exception.security;

import org.springframework.http.HttpStatus;

// Use this exception when a required header is missing in the request (check in HeaderSecurityFilter)
public class UnauthorizedException extends AbstractSecurityException {
    public UnauthorizedException(String msg) {
        super(msg, HttpStatus.UNAUTHORIZED);
    }
}
