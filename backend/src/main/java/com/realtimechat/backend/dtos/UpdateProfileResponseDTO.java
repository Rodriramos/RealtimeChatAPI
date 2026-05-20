package com.realtimechat.backend.dtos;

public record UpdateProfileResponseDTO(
    UserResponseDTO user,
    String token
) {}
