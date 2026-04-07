package com.pht.dev_edu.common.exception.security;

import org.springframework.http.HttpStatus;

// Use this exception when user try to access a resource that they don't have permission to access
public class AccessDeniedException extends  AbstractSecurityException {
    public AccessDeniedException(String msg) {
        super(msg, HttpStatus.FORBIDDEN);
    }
}
