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

import com.realtimechat.backend.entities.RoomMember;
import com.realtimechat.backend.entities.Room;
import com.realtimechat.backend.entities.User;
import com.realtimechat.backend.repositories.RoomMemberRepository;

@ExtendWith(MockitoExtension.class)
public class RoomMemberRepositoryTest {

    @Mock
    private RoomMemberRepository roomMemberRepository;

    private RoomMember testRoomMember;
    private Room testRoom;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");

        testRoom = new Room();
        testRoom.setId(1L);
        testRoom.setName("Test Room");

        testRoomMember = new RoomMember();
        testRoomMember.setId(1L);
        testRoomMember.setRoom(testRoom);
        testRoomMember.setUser(testUser);
        testRoomMember.setRole(RoomMember.Role.MEMBER);
    }

    @Test
    void testExistsByRoomIdAndUserId_True() {
        when(roomMemberRepository.existsByRoomIdAndUserId(1L, 1L))
                .thenReturn(true);

        boolean result = roomMemberRepository.existsByRoomIdAndUserId(1L, 1L);

        assertTrue(result);
    }

    @Test
    void testExistsByRoomIdAndUserId_False() {
        when(roomMemberRepository.existsByRoomIdAndUserId(1L, 999L))
                .thenReturn(false);

        boolean result = roomMemberRepository.existsByRoomIdAndUserId(1L, 999L);

        assertFalse(result);
    }

    @Test
    void testFindByUserIdAndSeenAtIsNull_Success() {
        testRoomMember.setSeenAt(null);

        when(roomMemberRepository.findByUserIdAndSeenAtIsNull(1L))
                .thenReturn(Arrays.asList(testRoomMember));

        List<RoomMember> result = roomMemberRepository.findByUserIdAndSeenAtIsNull(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertNull(result.get(0).getSeenAt());
    }

    @Test
    void testFindByUserIdAndSeenAtIsNull_EmptyList() {
        when(roomMemberRepository.findByUserIdAndSeenAtIsNull(999L))
                .thenReturn(Arrays.asList());

        List<RoomMember> result = roomMemberRepository.findByUserIdAndSeenAtIsNull(999L);

        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    void testFindByUserIdAndSeenAtIsNull_MultipleResults() {
        RoomMember member2 = new RoomMember();
        member2.setId(2L);
        member2.setSeenAt(null);

        when(roomMemberRepository.findByUserIdAndSeenAtIsNull(1L))
                .thenReturn(Arrays.asList(testRoomMember, member2));

        List<RoomMember> result = roomMemberRepository.findByUserIdAndSeenAtIsNull(1L);

        assertEquals(2, result.size());
    }

    @Test
    void testFindByUserId_Success() {
        when(roomMemberRepository.findByUserId(1L))
                .thenReturn(Arrays.asList(testRoomMember));

        List<RoomMember> result = roomMemberRepository.findByUserId(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getUser().getId());
    }

    @Test
    void testFindByUserId_EmptyList() {
        when(roomMemberRepository.findByUserId(999L))
                .thenReturn(Arrays.asList());

        List<RoomMember> result = roomMemberRepository.findByUserId(999L);

        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    void testFindByUserId_MultipleRooms() {
        RoomMember member2 = new RoomMember();
        member2.setId(2L);

        Room room2 = new Room();
        room2.setId(2L);
        room2.setName("Room 2");

        member2.setRoom(room2);
        member2.setUser(testUser);

        when(roomMemberRepository.findByUserId(1L))
                .thenReturn(Arrays.asList(testRoomMember, member2));

        List<RoomMember> result = roomMemberRepository.findByUserId(1L);

        assertEquals(2, result.size());
        assertEquals(1L, result.get(0).getRoom().getId());
        assertEquals(2L, result.get(1).getRoom().getId());
    }

    @Test
    void testSave_Success() {
        when(roomMemberRepository.save(any(RoomMember.class))).thenReturn(testRoomMember);

        RoomMember result = roomMemberRepository.save(testRoomMember);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(RoomMember.Role.MEMBER, result.getRole());
    }

    @Test
    void testFindById_Success() {
        when(roomMemberRepository.findById(1L)).thenReturn(Optional.of(testRoomMember));

        Optional<RoomMember> result = roomMemberRepository.findById(1L);

        assertTrue(result.isPresent());
        assertEquals(RoomMember.Role.MEMBER, result.get().getRole());
    }

    @Test
    void testFindById_NotFound() {
        when(roomMemberRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<RoomMember> result = roomMemberRepository.findById(999L);

        assertFalse(result.isPresent());
    }

    @Test
    void testDelete_Success() {
        roomMemberRepository.delete(testRoomMember);

        verify(roomMemberRepository, times(1)).delete(testRoomMember);
    }

    @Test
    void testExistsByRoomIdAndUserId_DifferentCombinations() {
        when(roomMemberRepository.existsByRoomIdAndUserId(1L, 1L)).thenReturn(true);
        when(roomMemberRepository.existsByRoomIdAndUserId(1L, 2L)).thenReturn(false);
        when(roomMemberRepository.existsByRoomIdAndUserId(2L, 1L)).thenReturn(false);

        assertTrue(roomMemberRepository.existsByRoomIdAndUserId(1L, 1L));
        assertFalse(roomMemberRepository.existsByRoomIdAndUserId(1L, 2L));
        assertFalse(roomMemberRepository.existsByRoomIdAndUserId(2L, 1L));
    }
}
