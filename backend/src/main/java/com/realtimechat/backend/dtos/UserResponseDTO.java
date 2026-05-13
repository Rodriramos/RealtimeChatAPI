package com.realtimechat.backend.dtos;

public record UserResponseDTO(
    Long id, 
    String username, 
    String email) 
{}
