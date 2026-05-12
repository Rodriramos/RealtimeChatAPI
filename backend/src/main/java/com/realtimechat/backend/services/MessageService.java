package com.realtimechat.backend.services;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.realtimechat.backend.entities.Message;
import com.realtimechat.backend.entities.Room;
import com.realtimechat.backend.entities.User;
import com.realtimechat.backend.repositories.MessageRepository;
import com.realtimechat.backend.repositories.RoomRepository;
import com.realtimechat.backend.repositories.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final RoomRepository roomRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Transactional
    public Message saveMessage(String content, Long roomId, String username) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + roomId));
        User sender = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

        Message message = new Message();
        message.setContent(content);
        message.setRoom(room);
        message.setUser(sender);
        return messageRepository.save(message);
    }

    public List<Message> getLastMessages(Long roomId, int limit) {
        return messageRepository
                .findTopNByRoomIdOrderByCreatedAtDesc(roomId, PageRequest.of(0, limit));
    }
}
