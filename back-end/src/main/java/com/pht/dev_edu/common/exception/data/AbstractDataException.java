package com.pht.dev_edu.common.exception.data;

import com.pht.dev_edu.common.exception.AbstractException;
import org.springframework.http.HttpStatus;

public abstract class AbstractDataException extends AbstractException {
    private final HttpStatus httpStatus;

    public AbstractDataException(String msg, HttpStatus httpStatus) {
        super(msg);
        this.httpStatus = httpStatus;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}