package com.realtimechat.backend.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realtimechat.backend.entities.Room;

public interface RoomRepository extends JpaRepository<Room, Long> {
    boolean existsByType(Room.RoomType type);
    boolean existsByNameAndType(String name, Room.RoomType type);
    Optional<Room> findByType(Room.RoomType type);
    List<Room> findAllByType(Room.RoomType type);

}
