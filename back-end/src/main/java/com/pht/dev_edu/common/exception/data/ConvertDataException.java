package com.pht.dev_edu.common.exception.data;

import org.springframework.http.HttpStatus;

// Use this exception when there is an error converting data types (mapper, cast, ...)
public class ConvertDataException extends AbstractDataException {
    public ConvertDataException(String msg) {
        super(msg, HttpStatus.BAD_REQUEST);
    }
}