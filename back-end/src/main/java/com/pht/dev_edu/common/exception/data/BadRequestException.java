package com.pht.dev_edu.common.exception.data;

import org.springframework.http.HttpStatus;

// Use this exception when the client sends a bad request (invalid parameters, malformed request syntax, etc.)
public class BadRequestException extends AbstractDataException {
    public BadRequestException(String msg) {
        super(msg, HttpStatus.BAD_REQUEST);
    }
}