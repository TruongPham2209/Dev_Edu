package com.pht.dev_edu.common.exception.security;

import com.pht.dev_edu.common.exception.AbstractException;
import org.springframework.http.HttpStatus;

public abstract class AbstractSecurityException extends AbstractException {
    private final HttpStatus httpStatus;

    public AbstractSecurityException(String msg, HttpStatus httpStatus) {
        super(msg);
        this.httpStatus = httpStatus;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}