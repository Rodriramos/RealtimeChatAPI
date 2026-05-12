package com.realtimechat.backend.controllers;

import java.security.Principal;
import java.util.List;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.realtimechat.backend.dtos.MessageResponseDTO;
import com.realtimechat.backend.dtos.SendMessageDTO;
import com.realtimechat.backend.entities.Message;
import com.realtimechat.backend.entities.Room;
import com.realtimechat.backend.repositories.RoomRepository;
import com.realtimechat.backend.services.MessageService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final MessageService messageService;
    private final RoomRepository roomRepository;

    @MessageMapping("/chat.global")
    @SendTo("/topic/messages")
    public MessageResponseDTO handleGlobalMessage(SendMessageDTO messageRequest, Principal principal) {
        Room global = roomRepository.findByType(Room.RoomType.GLOBAL)
                .orElseThrow(() -> new RuntimeException("Global room not found"));
        
        Message savedMessage = messageService.saveMessage(
            messageRequest.content(), 
            global.getId(), 
            principal.getName());

        return new MessageResponseDTO(
            savedMessage.getId(),
            savedMessage.getContent(),
            savedMessage.getCreatedAt(),
            savedMessage.getUser().getUsername(),
            savedMessage.getUser().getId()
        );
    }

    @GetMapping("/api/chat/global/history")
    @ResponseBody
    public List<MessageResponseDTO> getHistory() {
        Room global = roomRepository.findByType(Room.RoomType.GLOBAL)
                .orElseThrow(() -> new RuntimeException("Global room not found"));

        return messageService.getLastMessages(global.getId(), 50)
                .stream()
                .map(message -> new MessageResponseDTO(
                    message.getId(),
                    message.getContent(),
                    message.getCreatedAt(),
                    message.getUser().getUsername(),
                    message.getUser().getId()
                ))
                .toList();
    }
}
