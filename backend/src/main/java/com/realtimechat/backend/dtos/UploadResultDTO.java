package com.realtimechat.backend.dtos;

public record UploadResultDTO(
    String url, 
    String publicId, 
    String messageType
) {}
