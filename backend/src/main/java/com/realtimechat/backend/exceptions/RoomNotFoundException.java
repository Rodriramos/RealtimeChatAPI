package com.realtimechat.backend.exceptions;

public class RoomNotFoundException extends RuntimeException {
    public RoomNotFoundException(String roomId) {
        super("Room not found: " + roomId);
    }

}
