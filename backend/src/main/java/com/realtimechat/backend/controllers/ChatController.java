package com.realtimechat.backend.controllers;

import java.security.Principal;
import java.util.List;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import com.realtimechat.backend.dtos.MessageResponseDTO;
import com.realtimechat.backend.dtos.SendMessageDTO;
import com.realtimechat.backend.dtos.TypingNotificationDTO;
import com.realtimechat.backend.entities.Message;
import com.realtimechat.backend.exceptions.AccessDeniedExcpetion;
import com.realtimechat.backend.services.MessageService;
import com.realtimechat.backend.services.RoomService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final MessageService messageService;
    private final RoomService roomService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.room.{roomId}")
    public void handleRoomMessage(@DestinationVariable Long roomId, SendMessageDTO messageRequest,
            Principal principal) {
        if (!roomService.hasAccessToRoom(roomId, principal.getName())) {
            throw new AccessDeniedExcpetion("Room not found or access denied for room ID: " + roomId);
        }

        Message savedMessage = messageService.saveMessage(
                messageRequest.content(),
                roomId,
                principal.getName());

        String destination = "/topic/chat.room." + roomId;
        messagingTemplate.convertAndSend(destination, toResponse(savedMessage));
    }

    @GetMapping("/api/chat/room/{roomId}/history")
    @ResponseBody
    public List<MessageResponseDTO> getHistory(@PathVariable Long roomId, Principal principal) {
        if (!roomService.hasAccessToRoom(roomId, principal.getName())) {
            throw new AccessDeniedExcpetion("Room not found or access denied for room ID: " + roomId);
        }

        return messageService.getLastMessages(roomId, 50)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @MessageMapping("/chat.room.{roomId}.typing")
    public void handleTyping(@DestinationVariable Long roomId, Principal principal) {
        if (!roomService.hasAccessToRoom(roomId, principal.getName())) {
            throw new AccessDeniedExcpetion("Room not found or access denied for room ID: " + roomId);
        }

        messagingTemplate.convertAndSend(
        "/topic/chat.room." + roomId + ".typing",
        new TypingNotificationDTO(principal.getName())
    );
    }

    private MessageResponseDTO toResponse(Message message) {
        return new MessageResponseDTO(
                message.getId(),
                message.getContent(),
                message.getCreatedAt(),
                message.getUser().getUsername(),
                message.getUser().getId());
    }
}
