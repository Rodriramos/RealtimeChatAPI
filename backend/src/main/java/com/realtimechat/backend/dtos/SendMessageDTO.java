package com.realtimechat.backend.dtos;

public record SendMessageDTO(
    String content,
    String messageType,
    String fileUrl,
    String fileName
) {}
