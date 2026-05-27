package com.realtimechat.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;

import com.realtimechat.backend.entities.Message;
import com.realtimechat.backend.entities.Room;
import com.realtimechat.backend.entities.User;
import com.realtimechat.backend.exceptions.RoomNotFoundException;
import com.realtimechat.backend.exceptions.UserNotFoundException;
import com.realtimechat.backend.repositories.MessageRepository;
import com.realtimechat.backend.repositories.RoomRepository;
import com.realtimechat.backend.repositories.UserRepository;
import com.realtimechat.backend.services.MessageService;

@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private MessageService messageService;

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
        testRoom.setType(Room.RoomType.PRIVATE);

        testMessage = new Message();
        testMessage.setId(1L);
        testMessage.setContent("Test message");
        testMessage.setRoom(testRoom);
        testMessage.setUser(testUser);
        testMessage.setMessageType(Message.MessageType.TEXT);
    }

    @Test
    void testSaveMessageWithTextType_Success() {
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(messageRepository.save(any(Message.class))).thenReturn(testMessage);

        Message result = messageService.saveMessage("Test message", 1L, "testuser");

        assertNotNull(result);
        assertEquals("Test message", result.getContent());
        assertEquals(testUser, result.getUser());
        assertEquals(testRoom, result.getRoom());
        assertEquals(Message.MessageType.TEXT, result.getMessageType());
        verify(messageRepository, times(1)).save(any(Message.class));
    }

    @Test
    void testSaveMessageWithAllParameters_Success() {
        testMessage.setMessageType(Message.MessageType.IMAGE);
        testMessage.setFileUrl("http://example.com/image.jpg");
        testMessage.setFileName("image.jpg");

        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(messageRepository.save(any(Message.class))).thenReturn(testMessage);

        Message result = messageService.saveMessage(
                "Test message",
                1L,
                "testuser",
                Message.MessageType.IMAGE,
                "http://example.com/image.jpg",
                "image.jpg");

        assertNotNull(result);
        assertEquals("Test message", result.getContent());
        assertEquals(Message.MessageType.IMAGE, result.getMessageType());
        assertEquals("http://example.com/image.jpg", result.getFileUrl());
        assertEquals("image.jpg", result.getFileName());
        verify(messageRepository, times(1)).save(any(Message.class));
    }

    @Test
    void testSaveMessage_RoomNotFound() {
        when(roomRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RoomNotFoundException.class, () -> messageService.saveMessage("Test message", 999L, "testuser"));
        verify(messageRepository, never()).save(any());
    }

    @Test
    void testSaveMessage_UserNotFound() {
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> messageService.saveMessage("Test message", 1L, "nonexistent"));
        verify(messageRepository, never()).save(any());
    }

    @Test
    void testSaveMessage_WithVideoType() {
        testMessage.setMessageType(Message.MessageType.VIDEO);
        testMessage.setFileUrl("http://example.com/video.mp4");
        testMessage.setFileName("video.mp4");

        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(messageRepository.save(any(Message.class))).thenReturn(testMessage);

        Message result = messageService.saveMessage(
                "Test video",
                1L,
                "testuser",
                Message.MessageType.VIDEO,
                "http://example.com/video.mp4",
                "video.mp4");

        assertEquals(Message.MessageType.VIDEO, result.getMessageType());
        verify(messageRepository, times(1)).save(any(Message.class));
    }

    @Test
    void testSaveMessage_WithAudioType() {
        testMessage.setMessageType(Message.MessageType.AUDIO);
        testMessage.setFileUrl("http://example.com/audio.mp3");
        testMessage.setFileName("audio.mp3");

        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(messageRepository.save(any(Message.class))).thenReturn(testMessage);

        Message result = messageService.saveMessage(
                "Audio message",
                1L,
                "testuser",
                Message.MessageType.AUDIO,
                "http://example.com/audio.mp3",
                "audio.mp3");

        assertEquals(Message.MessageType.AUDIO, result.getMessageType());
    }

    @Test
    void testGetLastMessages_Success() {
        Message msg1 = new Message();
        msg1.setId(1L);
        msg1.setContent("Message 1");

        Message msg2 = new Message();
        msg2.setId(2L);
        msg2.setContent("Message 2");

        List<Message> messages = Arrays.asList(msg2, msg1);

        when(messageRepository.findByRoomIdOrderByCreatedAtDesc(1L, PageRequest.of(0, 50)))
                .thenReturn(messages);

        List<Message> result = messageService.getLastMessages(1L, 50);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Message 2", result.get(0).getContent());
        verify(messageRepository, times(1)).findByRoomIdOrderByCreatedAtDesc(1L, PageRequest.of(0, 50));
    }

    @Test
    void testGetLastMessages_EmptyList() {
        when(messageRepository.findByRoomIdOrderByCreatedAtDesc(1L, PageRequest.of(0, 10)))
                .thenReturn(Arrays.asList());

        List<Message> result = messageService.getLastMessages(1L, 10);

        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    void testGetLastMessages_WithDifferentLimits() {
        List<Message> messages = Arrays.asList(new Message(), new Message(), new Message());

        when(messageRepository.findByRoomIdOrderByCreatedAtDesc(1L, PageRequest.of(0, 100)))
                .thenReturn(messages);

        List<Message> result = messageService.getLastMessages(1L, 100);

        assertEquals(3, result.size());
        verify(messageRepository, times(1)).findByRoomIdOrderByCreatedAtDesc(1L, PageRequest.of(0, 100));
    }

    @Test
    void testSaveMessage_NullContent() {
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(messageRepository.save(any(Message.class))).thenReturn(testMessage);

        Message result = messageService.saveMessage(null, 1L, "testuser");

        assertNotNull(result);
        verify(messageRepository, times(1)).save(any(Message.class));
    }
}
