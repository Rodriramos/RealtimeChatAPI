package com.realtimechat.backend.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.realtimechat.backend.entities.Room;
import com.realtimechat.backend.entities.RoomMember;
import com.realtimechat.backend.entities.User;
import com.realtimechat.backend.exceptions.RoomNotFoundException;
import com.realtimechat.backend.exceptions.UserNotFoundException;
import com.realtimechat.backend.repositories.RoomMemberRepository;
import com.realtimechat.backend.repositories.RoomRepository;
import com.realtimechat.backend.repositories.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public Room createPrivateRoom(String roomName, String ownerUsername, List<String> invitedEmails) {
        User owner = userRepository.findByUsername(ownerUsername)
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + ownerUsername));

        Room room = new Room();
        room.setName(roomName);
        room.setType(Room.RoomType.PRIVATE);
        room.setCreatedBy(owner);
        roomRepository.save(room);

        addMember(room, owner, RoomMember.Role.OWNER);

        invitedEmails.forEach(email -> {
            userRepository.findByEmail(email).ifPresent(user -> addMember(room, user, RoomMember.Role.MEMBER));
        });
        
        return room;
    }

    public List<Room> getThematicRooms() {
        return roomRepository.findAllByType(Room.RoomType.THEMATIC);
    }

    public List<Room> getMyPrivateRooms(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + username));
        return roomMemberRepository.findByUserId(user.getId())
                .stream()
                .map(RoomMember::getRoom)
                .toList();
    }

    public boolean hasAccessToRoom(Long roomId, String username) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new RoomNotFoundException("Room not found with ID: " + roomId));

        if (room.getType() == Room.RoomType.GLOBAL || room.getType() == Room.RoomType.THEMATIC) {
            return true;
        } else {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UserNotFoundException("User not found with username: " + username));
            return roomMemberRepository.existsByRoomIdAndUserId(roomId, user.getId());
        }
    }

    private void addMember(Room room, User user, RoomMember.Role role) {
        RoomMember member = new RoomMember();
        member.setRoom(room);
        member.setUser(user);
        member.setRole(role);
        roomMemberRepository.save(member);
    }
}
