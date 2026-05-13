package com.realtimechat.backend.controllers;

import java.security.Principal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realtimechat.backend.dtos.CreatePrivateRoomRequestDTO;
import com.realtimechat.backend.dtos.RoomResponseDTO;
import com.realtimechat.backend.entities.Room;
import com.realtimechat.backend.services.RoomService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping("/thematic")
    public List<RoomResponseDTO> getThematicRooms() {
        return roomService.getThematicRooms()
                .stream()
                .map(RoomResponseDTO::from)
                .toList();
    }

    @PostMapping("/private")
    public ResponseEntity<RoomResponseDTO> createPrivateRoom(@RequestBody CreatePrivateRoomRequestDTO request, Principal principal) {
        Room room = roomService.createPrivateRoom(request.name(), principal.getName(), request.invitedEmails());
        return ResponseEntity.status(HttpStatus.CREATED).body(RoomResponseDTO.from(room));
    }
    
    @GetMapping("/private/mine")
    public List<RoomResponseDTO> getMyPrivateRooms(Principal principal) {
        return roomService.getMyPrivateRooms(principal.getName())
                .stream()
                .map(RoomResponseDTO::from)
                .toList();
    }
}
