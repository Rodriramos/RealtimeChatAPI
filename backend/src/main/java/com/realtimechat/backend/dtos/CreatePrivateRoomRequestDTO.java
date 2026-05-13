package com.realtimechat.backend.dtos;

import java.util.List;

public record CreatePrivateRoomRequestDTO(
    String name, 
    List<String> invitedEmails) 
{}
