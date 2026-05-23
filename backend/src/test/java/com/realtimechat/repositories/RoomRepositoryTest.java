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

import com.realtimechat.backend.entities.Room;
import com.realtimechat.backend.repositories.RoomRepository;

@ExtendWith(MockitoExtension.class)
class RoomRepositoryTest {

    @Mock
    private RoomRepository roomRepository;

    private Room testRoom;

    @BeforeEach
    void setUp() {
        testRoom = new Room();
        testRoom.setId(1L);
        testRoom.setName("Test Room");
        testRoom.setType(Room.RoomType.PRIVATE);
    }

    @Test
    void testFindByType_Success() {
        when(roomRepository.findByType(Room.RoomType.GLOBAL))
                .thenReturn(Optional.of(testRoom));

        Optional<Room> result = roomRepository.findByType(Room.RoomType.GLOBAL);

        assertTrue(result.isPresent());
        assertEquals("Test Room", result.get().getName());
    }

    @Test
    void testFindByType_NotFound() {
        when(roomRepository.findByType(Room.RoomType.PRIVATE))
                .thenReturn(Optional.empty());

        Optional<Room> result = roomRepository.findByType(Room.RoomType.PRIVATE);

        assertFalse(result.isPresent());
    }

    @Test
    void testFindAllByType_Success() {
        Room room1 = new Room();
        room1.setId(1L);
        room1.setType(Room.RoomType.THEMATIC);

        Room room2 = new Room();
        room2.setId(2L);
        room2.setType(Room.RoomType.THEMATIC);

        when(roomRepository.findAllByType(Room.RoomType.THEMATIC))
                .thenReturn(Arrays.asList(room1, room2));

        List<Room> result = roomRepository.findAllByType(Room.RoomType.THEMATIC);

        assertNotNull(result);
        assertEquals(2, result.size());
    }

    @Test
    void testFindAllByType_EmptyList() {
        when(roomRepository.findAllByType(Room.RoomType.THEMATIC))
                .thenReturn(Arrays.asList());

        List<Room> result = roomRepository.findAllByType(Room.RoomType.THEMATIC);

        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    void testExistsByType_True() {
        when(roomRepository.existsByType(Room.RoomType.GLOBAL))
                .thenReturn(true);

        boolean result = roomRepository.existsByType(Room.RoomType.GLOBAL);

        assertTrue(result);
    }

    @Test
    void testExistsByType_False() {
        when(roomRepository.existsByType(Room.RoomType.PRIVATE))
                .thenReturn(false);

        boolean result = roomRepository.existsByType(Room.RoomType.PRIVATE);

        assertFalse(result);
    }

    @Test
    void testExistsByNameAndType_True() {
        when(roomRepository.existsByNameAndType("Test Room", Room.RoomType.THEMATIC))
                .thenReturn(true);

        boolean result = roomRepository.existsByNameAndType("Test Room", Room.RoomType.THEMATIC);

        assertTrue(result);
    }

    @Test
    void testExistsByNameAndType_False() {
        when(roomRepository.existsByNameAndType("Non-existent", Room.RoomType.PRIVATE))
                .thenReturn(false);

        boolean result = roomRepository.existsByNameAndType("Non-existent", Room.RoomType.PRIVATE);

        assertFalse(result);
    }

    @Test
    void testSave_Success() {
        when(roomRepository.save(any(Room.class))).thenReturn(testRoom);

        Room result = roomRepository.save(testRoom);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Test Room", result.getName());
    }

    @Test
    void testFindById_Success() {
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));

        Optional<Room> result = roomRepository.findById(1L);

        assertTrue(result.isPresent());
        assertEquals("Test Room", result.get().getName());
    }

    @Test
    void testFindById_NotFound() {
        when(roomRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Room> result = roomRepository.findById(999L);

        assertFalse(result.isPresent());
    }

    @Test
    void testDelete_Success() {
        roomRepository.delete(testRoom);

        verify(roomRepository, times(1)).delete(testRoom);
    }

    @Test
    void testFindAllByType_MultipleTypes() {
        when(roomRepository.findAllByType(Room.RoomType.GLOBAL))
                .thenReturn(Arrays.asList(testRoom));
        when(roomRepository.findAllByType(Room.RoomType.THEMATIC))
                .thenReturn(Arrays.asList());

        List<Room> globalRooms = roomRepository.findAllByType(Room.RoomType.GLOBAL);
        List<Room> thematicRooms = roomRepository.findAllByType(Room.RoomType.THEMATIC);

        assertEquals(1, globalRooms.size());
        assertEquals(0, thematicRooms.size());
    }
}

