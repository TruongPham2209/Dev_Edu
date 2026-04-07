package com.pht.dev_edu.common.exception.io;

import org.springframework.http.HttpStatus;

// Use this exception when there is an error performing file operations (read, write, delete, etc.)
public class FilePerformException extends AbstractIOException {
    public FilePerformException(String msg) {
        super(msg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
