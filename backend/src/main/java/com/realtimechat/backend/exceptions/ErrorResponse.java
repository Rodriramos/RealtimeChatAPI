package com.realtimechat.backend.exceptions;

import java.time.LocalDateTime;

public record ErrorResponse(
    int status, 
    String message, 
    String path, 
    LocalDateTime timestamp) 
{}
