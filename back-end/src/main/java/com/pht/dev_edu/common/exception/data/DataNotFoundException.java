package com.pht.dev_edu.common.exception.data;

import org.springframework.http.HttpStatus;

// Use this exception when requested data is not found (not found or null in database)
public class DataNotFoundException extends AbstractDataException {
    public DataNotFoundException(String msg) {
        super(msg, HttpStatus.NOT_FOUND);
    }
}