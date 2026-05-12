package com.realtimechat.backend.exceptions;

public class PasswordMismatchException extends RuntimeException {
    public PasswordMismatchException(String message) {
        super("Passwords do not match: " + message);
    }
    
}
