package com.realtimechat.controllers;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.security.Principal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.realtimechat.backend.controllers.RoomController;
import com.realtimechat.backend.dtos.CreatePrivateRoomRequestDTO;
import com.realtimechat.backend.dtos.RoomResponseDTO;
import com.realtimechat.backend.entities.Room;
import com.realtimechat.backend.entities.RoomMember;
import com.realtimechat.backend.entities.User;
import com.realtimechat.backend.exceptions.UserNotFoundException;
import com.realtimechat.backend.repositories.RoomMemberRepository;
import com.realtimechat.backend.repositories.UserRepository;
import com.realtimechat.backend.services.RoomService;

@ExtendWith(MockitoExtension.class)
class RoomControllerTest {

    @Mock
    private RoomService roomService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoomMemberRepository roomMemberRepository;

    @Mock
    private Principal principal;

    @InjectMocks
    private RoomController roomController;

    private User testUser;
    private Room testRoom;
    private RoomMember testRoomMember;

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
        testRoom.setCreatedBy(testUser);

        testRoomMember = new RoomMember();
        testRoomMember.setId(1L);
        testRoomMember.setRoom(testRoom);
        testRoomMember.setUser(testUser);
        testRoomMember.setRole(RoomMember.Role.OWNER);

        when(principal.getName()).thenReturn("testuser");
    }

    // -------------------------------------------------------------------------
    // getThematicRooms
    // -------------------------------------------------------------------------

    @Test
    void testGetThematicRooms_Success() {
        Room thematicRoom = new Room();
        thematicRoom.setId(2L);
        thematicRoom.setName("Thematic Room");
        thematicRoom.setType(Room.RoomType.THEMATIC);

        when(roomService.getThematicRooms()).thenReturn(Arrays.asList(thematicRoom));

        List<RoomResponseDTO> result = roomController.getThematicRooms();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Thematic Room", result.get(0).name());
        assertEquals("THEMATIC", result.get(0).type());
        verify(roomService, times(1)).getThematicRooms();
    }

    @Test
    void testGetThematicRooms_EmptyList() {
        when(roomService.getThematicRooms()).thenReturn(Arrays.asList());

        List<RoomResponseDTO> result = roomController.getThematicRooms();

        assertNotNull(result);
        assertEquals(0, result.size());
    }

    // -------------------------------------------------------------------------
    // createPrivateRoom
    // -------------------------------------------------------------------------

    @Test
    void testCreatePrivateRoom_Success() {
        CreatePrivateRoomRequestDTO request = new CreatePrivateRoomRequestDTO("New Room", Arrays.asList());

        when(roomService.createPrivateRoom("New Room", "testuser", Arrays.asList()))
                .thenReturn(testRoom);

        ResponseEntity<RoomResponseDTO> response = roomController.createPrivateRoom(request, principal);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(201, response.getStatusCode().value()); // ✅ no deprecated
        assertNotNull(response.getBody());
        assertEquals("Test Room", response.getBody().name());
        assertEquals("PRIVATE", response.getBody().type());
        verify(roomService, times(1)).createPrivateRoom("New Room", "testuser", Arrays.asList());
    }

    @Test
    void testCreatePrivateRoom_WithInvitees() {
        List<String> invitees = Arrays.asList("user1@example.com", "user2@example.com");
        CreatePrivateRoomRequestDTO request = new CreatePrivateRoomRequestDTO("New Room", invitees);

        when(roomService.createPrivateRoom("New Room", "testuser", invitees))
                .thenReturn(testRoom);

        ResponseEntity<RoomResponseDTO> response = roomController.createPrivateRoom(request, principal);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(roomService, times(1)).createPrivateRoom("New Room", "testuser", invitees);
    }

    // -------------------------------------------------------------------------
    // getMyPrivateRooms
    // -------------------------------------------------------------------------

    @Test
    void testGetMyPrivateRooms_Success() {
        when(roomService.getMyPrivateRooms("testuser")).thenReturn(Arrays.asList(testRoom));

        List<RoomResponseDTO> result = roomController.getMyPrivateRooms(principal);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Room", result.get(0).name());
        verify(roomService, times(1)).getMyPrivateRooms("testuser");
    }

    @Test
    void testGetMyPrivateRooms_EmptyList() {
        when(roomService.getMyPrivateRooms("testuser")).thenReturn(Arrays.asList());

        List<RoomResponseDTO> result = roomController.getMyPrivateRooms(principal);

        assertNotNull(result);
        assertEquals(0, result.size());
    }

    // -------------------------------------------------------------------------
    // getPendingInvitations
    // -------------------------------------------------------------------------

    @Test
    void testGetPendingInvitations_Success() {
        testRoomMember.setSeenAt(null);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(roomMemberRepository.findByUserIdAndSeenAtIsNull(1L))
                .thenReturn(Arrays.asList(testRoomMember));

        List<RoomResponseDTO> result = roomController.getPendingInvitations(principal);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Room", result.get(0).name());
        verify(roomMemberRepository, times(1)).findByUserIdAndSeenAtIsNull(1L);
    }

    @Test
    void testGetPendingInvitations_UserNotFound() {
        // principal.getName() devuelve "testuser" → simulamos que no existe en BD
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () ->
            roomController.getPendingInvitations(principal)
        );
        verify(roomMemberRepository, never()).findByUserIdAndSeenAtIsNull(anyLong());
    }

    @Test
    void testGetPendingInvitations_NoInvitations() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(roomMemberRepository.findByUserIdAndSeenAtIsNull(1L)).thenReturn(Arrays.asList());

        List<RoomResponseDTO> result = roomController.getPendingInvitations(principal);

        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    void testGetPendingInvitations_MultipleInvitations() {
        Room room2 = new Room();
        room2.setId(2L);
        room2.setName("Room 2");
        room2.setType(Room.RoomType.PRIVATE);

        RoomMember member2 = new RoomMember();
        member2.setId(2L);
        member2.setRoom(room2);
        member2.setUser(testUser);
        member2.setSeenAt(null);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(roomMemberRepository.findByUserIdAndSeenAtIsNull(1L))
                .thenReturn(Arrays.asList(testRoomMember, member2));

        List<RoomResponseDTO> result = roomController.getPendingInvitations(principal);

        assertEquals(2, result.size());
    }

    // -------------------------------------------------------------------------
    // markInvitationsSeen
    // -------------------------------------------------------------------------

    @Test
    void testMarkInvitationsSeen_Success() {
        testRoomMember.setSeenAt(null);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(roomMemberRepository.findByUserIdAndSeenAtIsNull(1L))
                .thenReturn(Arrays.asList(testRoomMember));

        roomController.markInvitationsSeen(principal);

        verify(roomMemberRepository, times(1)).findByUserIdAndSeenAtIsNull(1L);
        verify(roomMemberRepository, times(1)).save(any(RoomMember.class));
    }

    @Test
    void testMarkInvitationsSeen_UserNotFound() {
        // principal.getName() devuelve "testuser" → simulamos que no existe en BD
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () ->
            roomController.markInvitationsSeen(principal)
        );
        verify(roomMemberRepository, never()).save(any());
    }

    @Test
    void testMarkInvitationsSeen_NoInvitations() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(roomMemberRepository.findByUserIdAndSeenAtIsNull(1L)).thenReturn(Arrays.asList());

        roomController.markInvitationsSeen(principal);

        verify(roomMemberRepository, times(1)).findByUserIdAndSeenAtIsNull(1L);
        verify(roomMemberRepository, never()).save(any());
    }

    @Test
    void testMarkInvitationsSeen_SetsSeenAt() {
        testRoomMember.setSeenAt(null);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(roomMemberRepository.findByUserIdAndSeenAtIsNull(1L))
                .thenReturn(Arrays.asList(testRoomMember));

        roomController.markInvitationsSeen(principal);

        // Verificamos que se guardó con seenAt != null, sin asumir el tipo concreto
        verify(roomMemberRepository, times(1)).save(argThat(member ->
                member.getSeenAt() != null
        ));
    }

    @Test
    void testMarkInvitationsSeen_MultipleInvitations_SavesAll() {
        Room room2 = new Room();
        room2.setId(2L);
        room2.setName("Room 2");
        room2.setType(Room.RoomType.PRIVATE);

        RoomMember member2 = new RoomMember();
        member2.setId(2L);
        member2.setRoom(room2);
        member2.setUser(testUser);
        member2.setSeenAt(null);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(roomMemberRepository.findByUserIdAndSeenAtIsNull(1L))
                .thenReturn(Arrays.asList(testRoomMember, member2));

        roomController.markInvitationsSeen(principal);

        // Se llama save una vez por cada invitación
        verify(roomMemberRepository, times(2)).save(any(RoomMember.class));
    }
}