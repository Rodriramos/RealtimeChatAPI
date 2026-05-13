package com.realtimechat.backend.exceptions;

public class AccessDeniedExcpetion extends RuntimeException {
    public AccessDeniedExcpetion(String message) {
        super(message);
    }

}
