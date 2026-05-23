package com.realtimechat.controllers;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.security.Principal;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.realtimechat.backend.controllers.ChatController;
import com.realtimechat.backend.dtos.MessageResponseDTO;
import com.realtimechat.backend.dtos.SendMessageDTO;
import com.realtimechat.backend.entities.Message;
import com.realtimechat.backend.entities.Room;
import com.realtimechat.backend.entities.User;
import com.realtimechat.backend.exceptions.AccessDeniedExcpetion;
import com.realtimechat.backend.services.MessageService;
import com.realtimechat.backend.services.RoomService;

@ExtendWith(MockitoExtension.class)
class ChatControllerTest {

    @Mock
    private MessageService messageService;

    @Mock
    private RoomService roomService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private Principal principal;

    @InjectMocks
    private ChatController chatController;

    private User testUser;
    private Room testRoom;
    private Message testMessage;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        testRoom = new Room();
        testRoom.setId(1L);
        testRoom.setName("Test Room");

        testMessage = new Message();
        testMessage.setId(1L);
        testMessage.setContent("Test message");
        testMessage.setRoom(testRoom);
        testMessage.setUser(testUser);
        testMessage.setMessageType(Message.MessageType.TEXT);

        when(principal.getName()).thenReturn("testuser");
    }

    @Test
    void testHandleRoomMessage_TextMessage_Success() {
        SendMessageDTO messageRequest = new SendMessageDTO("Test message", null, null, null);

        when(roomService.hasAccessToRoom(1L, "testuser")).thenReturn(true);
        when(messageService.saveMessage(anyString(), eq(1L), anyString(), any(), isNull(), isNull()))
                .thenReturn(testMessage);

        chatController.handleRoomMessage(1L, messageRequest, principal);

        verify(messageService, times(1)).saveMessage(
                "Test message", 1L, "testuser", Message.MessageType.TEXT, null, null);
        verify(messagingTemplate, times(1)).convertAndSend(
                "/topic/chat.room.1", any(MessageResponseDTO.class));
    }

    @Test
    void testHandleRoomMessage_ImageMessage_Success() {
        SendMessageDTO messageRequest = new SendMessageDTO(
                "Image message", "IMAGE", "http://example.com/image.jpg", null);
        testMessage.setMessageType(Message.MessageType.IMAGE);
        testMessage.setFileUrl("http://example.com/image.jpg");

        when(roomService.hasAccessToRoom(1L, "testuser")).thenReturn(true);
        when(messageService.saveMessage(anyString(), eq(1L), anyString(), any(), anyString(), anyString()))
                .thenReturn(testMessage);

        chatController.handleRoomMessage(1L, messageRequest, principal);

        verify(messageService, times(1)).saveMessage(
                "Image message", 1L, "testuser", Message.MessageType.IMAGE, 
                "http://example.com/image.jpg", null);
        verify(messagingTemplate, times(1)).convertAndSend(
                "/topic/chat.room.1", any(MessageResponseDTO.class));
    }

    @Test
    void testHandleRoomMessage_VideoMessage_Success() {
        SendMessageDTO messageRequest = new SendMessageDTO(
                "Video message", "VIDEO", "http://example.com/video.mp4", null);

        when(roomService.hasAccessToRoom(1L, "testuser")).thenReturn(true);
        when(messageService.saveMessage(anyString(), eq(1L), anyString(), any(), anyString(), anyString()))
                .thenReturn(testMessage);

        chatController.handleRoomMessage(1L, messageRequest, principal);

        verify(messageService, times(1)).saveMessage(
                anyString(), eq(1L), eq("testuser"), eq(Message.MessageType.VIDEO), 
                anyString(), isNull());
    }

    @Test
    void testHandleRoomMessage_AccessDenied() {
        SendMessageDTO messageRequest = new SendMessageDTO("Test message", null, null, null);

        when(roomService.hasAccessToRoom(1L, "testuser")).thenReturn(false);

        assertThrows(AccessDeniedExcpetion.class, () ->
            chatController.handleRoomMessage(1L, messageRequest, principal)
        );
        verify(messageService, never()).saveMessage(anyString(), anyLong(), anyString(), any(), anyString(), anyString());
    }

    @Test
    void testGetHistory_Success() {
        Message msg1 = new Message();
        msg1.setId(1L);
        msg1.setContent("Message 1");
        msg1.setUser(testUser);
        msg1.setRoom(testRoom);

        when(roomService.hasAccessToRoom(1L, "testuser")).thenReturn(true);
        when(messageService.getLastMessages(1L, 50)).thenReturn(Arrays.asList(msg1));

        List<MessageResponseDTO> result = chatController.getHistory(1L, principal);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(messageService, times(1)).getLastMessages(1L, 50);
    }

    @Test
    void testGetHistory_AccessDenied() {
        when(roomService.hasAccessToRoom(1L, "testuser")).thenReturn(false);

        assertThrows(AccessDeniedExcpetion.class, () ->
            chatController.getHistory(1L, principal)
        );
        verify(messageService, never()).getLastMessages(anyLong(), anyInt());
    }

    @Test
    void testGetHistory_EmptyHistory() {
        when(roomService.hasAccessToRoom(1L, "testuser")).thenReturn(true);
        when(messageService.getLastMessages(1L, 50)).thenReturn(Arrays.asList());

        List<MessageResponseDTO> result = chatController.getHistory(1L, principal);

        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    void testHandleTyping_Success() {
        when(roomService.hasAccessToRoom(1L, "testuser")).thenReturn(true);

        chatController.handleTyping(1L, principal);

        verify(messagingTemplate, times(1)).convertAndSend(
        eq("/topic/chat.room.1.typing"), (Object) any());
    }

    @Test
    void testHandleTyping_AccessDenied() {
        when(roomService.hasAccessToRoom(1L, "testuser")).thenReturn(false);

        assertThrows(AccessDeniedExcpetion.class, () ->
            chatController.handleTyping(1L, principal)
        );
        verify(messagingTemplate, times(1)).convertAndSend(
        eq("/topic/chat.room.1"), (Object) any(MessageResponseDTO.class));
    }

    @Test
    void testHandleRoomMessage_WithFileName() {
        SendMessageDTO messageRequest = new SendMessageDTO(
                "File message", "FILE", "http://example.com/file.pdf", "file.pdf");

        when(roomService.hasAccessToRoom(1L, "testuser")).thenReturn(true);
        when(messageService.saveMessage(anyString(), eq(1L), anyString(), any(), anyString(), anyString()))
                .thenReturn(testMessage);

        chatController.handleRoomMessage(1L, messageRequest, principal);

        verify(messagingTemplate, times(1)).convertAndSend(
                "/topic/chat.room.1", any(MessageResponseDTO.class));
    }

    @Test
    void testHandleRoomMessage_NullMessageType() {
        SendMessageDTO messageRequest = new SendMessageDTO("Test message", null, null, null);

        when(roomService.hasAccessToRoom(1L, "testuser")).thenReturn(true);
        when(messageService.saveMessage(anyString(), eq(1L), anyString(), any(), isNull(), isNull()))
                .thenReturn(testMessage);

        chatController.handleRoomMessage(1L, messageRequest, principal);

        verify(messageService, times(1)).saveMessage(
                "Test message", 1L, "testuser", Message.MessageType.TEXT, null, null);
    }
}
