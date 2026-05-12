package com.realtimechat.backend.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realtimechat.backend.entities.Room;

public interface RoomRepository extends JpaRepository<Room, Long> {
    boolean existsByType(Room.RoomType type);
    Optional<Room> findByType(Room.RoomType type);
}
