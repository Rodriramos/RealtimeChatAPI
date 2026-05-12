package com.realtimechat.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realtimechat.backend.entities.Room;

public interface RoomRepository extends JpaRepository<Room, Long> {
    boolean existsByType(Room.RoomType type);
}
