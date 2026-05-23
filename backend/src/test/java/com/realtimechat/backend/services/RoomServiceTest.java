package com.realtimechat.backend.services;

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
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.realtimechat.backend.dtos.InvitationNotificationDTO;
import com.realtimechat.backend.entities.Room;
import com.realtimechat.backend.entities.RoomMember;
import com.realtimechat.backend.entities.User;
import com.realtimechat.backend.exceptions.RoomNotFoundException;
import com.realtimechat.backend.exceptions.UserNotFoundException;
import com.realtimechat.backend.repositories.RoomMemberRepository;
import com.realtimechat.backend.repositories.RoomRepository;
import com.realtimechat.backend.repositories.UserRepository;
import com.realtimechat.backend.services.RoomService;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private RoomMemberRepository roomMemberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private RoomService roomService;

    private User testOwner;
    private User testMember;
    private Room testRoom;
    private RoomMember testRoomMember;

    @BeforeEach
    void setUp() {
        testOwner = new User();
        testOwner.setId(1L);
        testOwner.setUsername("owner");
        testOwner.setEmail("owner@example.com");

        testMember = new User();
        testMember.setId(2L);
        testMember.setUsername("member");
        testMember.setEmail("member@example.com");

        testRoom = new Room();
        testRoom.setId(1L);
        testRoom.setName("Test Room");
        testRoom.setType(Room.RoomType.PRIVATE);
        testRoom.setCreatedBy(testOwner);

        testRoomMember = new RoomMember();
        testRoomMember.setId(1L);
        testRoomMember.setRoom(testRoom);
        testRoomMember.setUser(testMember);
        testRoomMember.setRole(RoomMember.Role.MEMBER);
    }

    @Test
    void testCreatePrivateRoom_Success() {
        when(userRepository.findByUsername("owner")).thenReturn(Optional.of(testOwner));
        when(roomRepository.save(any(Room.class))).thenReturn(testRoom);
        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(testMember));

        Room result = roomService.createPrivateRoom("Test Room", "owner", Arrays.asList("member@example.com"));

        assertNotNull(result);
        assertEquals("Test Room", result.getName());
        assertEquals(Room.RoomType.PRIVATE, result.getType());
        assertEquals(testOwner, result.getCreatedBy());
        verify(roomRepository, times(1)).save(any(Room.class));
        verify(roomMemberRepository, atLeast(1)).save(any(RoomMember.class));
    }

    @Test
    void testCreatePrivateRoom_OwnerNotFound() {
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () ->
            roomService.createPrivateRoom("Test Room", "nonexistent", Arrays.asList())
        );
        verify(roomRepository, never()).save(any());
    }

    @Test
    void testCreatePrivateRoom_WithMultipleInvitees() {
        User user2 = new User();
        user2.setId(3L);
        user2.setUsername("user2");
        user2.setEmail("user2@example.com");

        when(userRepository.findByUsername("owner")).thenReturn(Optional.of(testOwner));
        when(roomRepository.save(any(Room.class))).thenReturn(testRoom);
        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(testMember));
        when(userRepository.findByEmail("user2@example.com")).thenReturn(Optional.of(user2));

        Room result = roomService.createPrivateRoom("Test Room", "owner", 
            Arrays.asList("member@example.com", "user2@example.com"));

        assertNotNull(result);
        verify(roomMemberRepository, times(3)).save(any(RoomMember.class));
    }

    @Test
    void testCreatePrivateRoom_WithNonexistentInvitees() {
        when(userRepository.findByUsername("owner")).thenReturn(Optional.of(testOwner));
        when(roomRepository.save(any(Room.class))).thenReturn(testRoom);
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        Room result = roomService.createPrivateRoom("Test Room", "owner", 
            Arrays.asList("nonexistent@example.com"));

        assertNotNull(result);
        verify(roomMemberRepository, times(1)).save(any(RoomMember.class));
    }

    @Test
    void testGetThematicRooms_Success() {
        Room thematicRoom1 = new Room();
        thematicRoom1.setId(1L);
        thematicRoom1.setType(Room.RoomType.THEMATIC);

        Room thematicRoom2 = new Room();
        thematicRoom2.setId(2L);
        thematicRoom2.setType(Room.RoomType.THEMATIC);

        when(roomRepository.findAllByType(Room.RoomType.THEMATIC))
                .thenReturn(Arrays.asList(thematicRoom1, thematicRoom2));

        List<Room> result = roomService.getThematicRooms();

        assertNotNull(result);
        assertEquals(2, result.size());
        verify(roomRepository, times(1)).findAllByType(Room.RoomType.THEMATIC);
    }

    @Test
    void testGetThematicRooms_EmptyList() {
        when(roomRepository.findAllByType(Room.RoomType.THEMATIC)).thenReturn(Arrays.asList());

        List<Room> result = roomService.getThematicRooms();

        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    void testGetMyPrivateRooms_Success() {
        when(userRepository.findByUsername("member")).thenReturn(Optional.of(testMember));
        when(roomMemberRepository.findByUserId(2L)).thenReturn(Arrays.asList(testRoomMember));

        List<Room> result = roomService.getMyPrivateRooms("member");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testRoom, result.get(0));
        verify(roomMemberRepository, times(1)).findByUserId(2L);
    }

    @Test
    void testGetMyPrivateRooms_UserNotFound() {
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () ->
            roomService.getMyPrivateRooms("nonexistent")
        );
    }

    @Test
    void testGetMyPrivateRooms_NoRooms() {
        when(userRepository.findByUsername("member")).thenReturn(Optional.of(testMember));
        when(roomMemberRepository.findByUserId(2L)).thenReturn(Arrays.asList());

        List<Room> result = roomService.getMyPrivateRooms("member");

        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    void testHasAccessToRoom_GlobalRoom_AlwaysTrue() {
        Room globalRoom = new Room();
        globalRoom.setId(1L);
        globalRoom.setType(Room.RoomType.GLOBAL);

        when(roomRepository.findById(1L)).thenReturn(Optional.of(globalRoom));

        boolean result = roomService.hasAccessToRoom(1L, "anyuser");

        assertTrue(result);
    }

    @Test
    void testHasAccessToRoom_ThematicRoom_AlwaysTrue() {
        Room thematicRoom = new Room();
        thematicRoom.setId(1L);
        thematicRoom.setType(Room.RoomType.THEMATIC);

        when(roomRepository.findById(1L)).thenReturn(Optional.of(thematicRoom));

        boolean result = roomService.hasAccessToRoom(1L, "anyuser");

        assertTrue(result);
    }

    @Test
    void testHasAccessToRoom_PrivateRoom_UserIsMember() {
        Room privateRoom = new Room();
        privateRoom.setId(1L);
        privateRoom.setType(Room.RoomType.PRIVATE);

        when(roomRepository.findById(1L)).thenReturn(Optional.of(privateRoom));
        when(userRepository.findByUsername("member")).thenReturn(Optional.of(testMember));
        when(roomMemberRepository.existsByRoomIdAndUserId(1L, 2L)).thenReturn(true);

        boolean result = roomService.hasAccessToRoom(1L, "member");

        assertTrue(result);
    }

    @Test
    void testHasAccessToRoom_PrivateRoom_UserIsNotMember() {
        Room privateRoom = new Room();
        privateRoom.setId(1L);
        privateRoom.setType(Room.RoomType.PRIVATE);

        when(roomRepository.findById(1L)).thenReturn(Optional.of(privateRoom));
        when(userRepository.findByUsername("nonmember")).thenReturn(Optional.of(testMember));
        when(roomMemberRepository.existsByRoomIdAndUserId(1L, 2L)).thenReturn(false);

        boolean result = roomService.hasAccessToRoom(1L, "nonmember");

        assertFalse(result);
    }

    @Test
    void testHasAccessToRoom_RoomNotFound() {
        when(roomRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RoomNotFoundException.class, () ->
            roomService.hasAccessToRoom(999L, "member")
        );
    }

    @Test
    void testHasAccessToRoom_PrivateRoom_UserNotFound() {
        Room privateRoom = new Room();
        privateRoom.setId(1L);
        privateRoom.setType(Room.RoomType.PRIVATE);

        when(roomRepository.findById(1L)).thenReturn(Optional.of(privateRoom));
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () ->
            roomService.hasAccessToRoom(1L, "nonexistent")
        );
    }
}
