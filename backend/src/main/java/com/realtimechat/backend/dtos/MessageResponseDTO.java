package com.realtimechat.backend.dtos;

import java.time.Instant;

public record MessageResponseDTO(
    Long id, 
    String content, 
    Instant sentAt, 
    String senderUsername, 
    Long senderId) 
{}
