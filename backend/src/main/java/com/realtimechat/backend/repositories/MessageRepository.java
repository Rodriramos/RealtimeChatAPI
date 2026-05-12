package com.realtimechat.backend.repositories;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import com.realtimechat.backend.entities.Message;

public interface MessageRepository extends JpaRepository<Message, Long> {
    // Custom query to get the last N messages for a room
    List<Message> findTopNByRoomIdOrderByCreatedAtDesc(Long roomId, PageRequest pageRequest);
}
