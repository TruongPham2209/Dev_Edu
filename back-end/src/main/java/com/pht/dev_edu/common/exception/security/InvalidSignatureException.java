package com.pht.dev_edu.common.exception.security;

import org.springframework.http.HttpStatus;

// Use this exception when the signature of the token is invalid (service to service communication)
public class InvalidSignatureException extends AbstractSecurityException {
    public InvalidSignatureException(String msg) {
        super(msg, HttpStatus.UNAUTHORIZED);
    }
}
