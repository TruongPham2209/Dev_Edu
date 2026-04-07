package com.pht.dev_edu.common.exception.io;

import com.pht.dev_edu.common.exception.AbstractException;
import org.springframework.http.HttpStatus;

public abstract class AbstractIOException extends AbstractException {
    private final HttpStatus httpStatus;

    public AbstractIOException(String msg, HttpStatus httpStatus) {
        super(msg);
        this.httpStatus = httpStatus;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}