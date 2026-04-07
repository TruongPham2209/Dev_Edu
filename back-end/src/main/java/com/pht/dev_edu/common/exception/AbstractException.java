package com.pht.dev_edu.common.exception;

import org.springframework.http.HttpStatus;

public abstract class AbstractException extends RuntimeException {
    public abstract HttpStatus getHttpStatus();

    public AbstractException(String msg) {
        super(msg);
    }
}