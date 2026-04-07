package com.pht.dev_edu.common.exception.server;

import org.springframework.http.HttpStatus;

// Use this exception when there is an error generating a key (signature, encryption, etc.)
public class ServerInternalException extends AbstractServerException {
    public ServerInternalException(String msg) {
        super(msg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
