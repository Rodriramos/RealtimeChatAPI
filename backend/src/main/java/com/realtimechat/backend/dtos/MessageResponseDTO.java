package com.realtimechat.backend.dtos;

import java.time.Instant;

public record MessageResponseDTO(
    Long id, 
    String content, 
    Instant sentAt,
    String messageType,
    String fileUrl,
    String fileName,
    String senderUsername, 
    Long senderId
) {}
