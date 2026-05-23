package com.realtimechat.repositories;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.realtimechat.backend.entities.Message;
import com.realtimechat.backend.repositories.MessageRepository;

@ExtendWith(MockitoExtension.class)
class MessageRepositoryTest {

    @Mock
    private MessageRepository messageRepository;

    private Message testMessage;
    private Pageable pageable;

    @BeforeEach
    void setUp() {
        testMessage = new Message();
        testMessage.setId(1L);
        testMessage.setContent("Test message");

        pageable = PageRequest.of(0, 10); // ✅ valor real reutilizable
    }

    @Test
    void testFindByRoomIdOrderByCreatedAtDesc_Success() {
        Message msg1 = new Message();
        msg1.setId(1L);
        msg1.setContent("Message 1");

        Message msg2 = new Message();
        msg2.setId(2L);
        msg2.setContent("Message 2");

        when(messageRepository.findByRoomIdOrderByCreatedAtDesc(anyLong(), any(Pageable.class)))
                .thenReturn(Arrays.asList(msg2, msg1));

        List<Message> result = messageRepository.findByRoomIdOrderByCreatedAtDesc(1L, pageable); // ✅

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Message 2", result.get(0).getContent());
        assertEquals("Message 1", result.get(1).getContent());
    }

    @Test
    void testFindByRoomIdOrderByCreatedAtDesc_EmptyList() {
        when(messageRepository.findByRoomIdOrderByCreatedAtDesc(anyLong(), any(Pageable.class)))
                .thenReturn(Arrays.asList());

        List<Message> result = messageRepository.findByRoomIdOrderByCreatedAtDesc(999L, pageable); // ✅

        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    void testFindByRoomIdOrderByCreatedAtDesc_SortOrder() {
        Message msg1 = new Message();
        msg1.setId(1L);

        Message msg2 = new Message();
        msg2.setId(2L);

        Message msg3 = new Message();
        msg3.setId(3L);

        when(messageRepository.findByRoomIdOrderByCreatedAtDesc(anyLong(), any(Pageable.class)))
                .thenReturn(Arrays.asList(msg3, msg2, msg1));

        List<Message> result = messageRepository.findByRoomIdOrderByCreatedAtDesc(1L, pageable); // ✅

        assertEquals(3, result.size());
        assertEquals(3L, result.get(0).getId());
        assertEquals(2L, result.get(1).getId());
        assertEquals(1L, result.get(2).getId());
    }

    @Test
    void testSave_Success() {
        when(messageRepository.save(any(Message.class))).thenReturn(testMessage);

        Message result = messageRepository.save(testMessage);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Test message", result.getContent());
    }

    @Test
    void testFindById_Success() {
        when(messageRepository.findById(1L)).thenReturn(Optional.of(testMessage));

        Optional<Message> result = messageRepository.findById(1L);

        assertTrue(result.isPresent());
        assertEquals("Test message", result.get().getContent());
    }

    @Test
    void testFindById_NotFound() {
        when(messageRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Message> result = messageRepository.findById(999L);

        assertFalse(result.isPresent());
    }

    @Test
    void testDelete_Success() {
        messageRepository.delete(testMessage);

        verify(messageRepository, times(1)).delete(testMessage);
    }

    @Test
    void testFindByRoomIdOrderByCreatedAtDesc_WithLimit() {
        Message msg1 = new Message();
        msg1.setId(1L);

        Message msg2 = new Message();
        msg2.setId(2L);

        when(messageRepository.findByRoomIdOrderByCreatedAtDesc(anyLong(), any(Pageable.class)))
                .thenReturn(Arrays.asList(msg2, msg1));

        List<Message> result = messageRepository.findByRoomIdOrderByCreatedAtDesc(1L, pageable); // ✅

        assertEquals(2, result.size());
    }
}