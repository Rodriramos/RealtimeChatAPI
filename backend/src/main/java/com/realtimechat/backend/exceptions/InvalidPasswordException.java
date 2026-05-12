package com.realtimechat.backend.exceptions;

public class InvalidPasswordException extends RuntimeException {
    public InvalidPasswordException(String message) {
        super("Invalid password: " + message);
    }

}
