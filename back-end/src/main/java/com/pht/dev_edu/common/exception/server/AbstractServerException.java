package com.pht.dev_edu.common.exception.server;

import com.pht.dev_edu.common.exception.AbstractException;
import org.springframework.http.HttpStatus;

public abstract class AbstractServerException extends AbstractException {
    private final HttpStatus httpStatus;

    public AbstractServerException(String msg, HttpStatus httpStatus) {
        super(msg);
        this.httpStatus = httpStatus;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}