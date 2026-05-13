package com.realtimechat.backend.dtos;

import com.realtimechat.backend.entities.Room;

public record RoomResponseDTO(
    Long id, 
    String name, 
    String type) {

    public static RoomResponseDTO from(Room room) {
        return new RoomResponseDTO(
            room.getId(), 
            room.getName(), 
            room.getType().name()
        );
    }
}
