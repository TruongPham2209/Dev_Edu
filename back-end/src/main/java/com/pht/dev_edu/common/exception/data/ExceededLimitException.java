package com.pht.dev_edu.common.exception.data;

import org.springframework.http.HttpStatus;

// Use this exception when the request exceeds a predefined limit, such as size or rate limits. (limit images per request, request size)
public class ExceededLimitException extends AbstractDataException {
    public ExceededLimitException(String msg) {
        super(msg, HttpStatus.PAYLOAD_TOO_LARGE);
    }
}