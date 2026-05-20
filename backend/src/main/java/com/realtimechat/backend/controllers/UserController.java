package com.realtimechat.backend.controllers;

import java.security.Principal;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realtimechat.backend.dtos.UserResponseDTO;
import com.realtimechat.backend.entities.User;
import com.realtimechat.backend.exceptions.UserNotFoundException;
import com.realtimechat.backend.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public UserResponseDTO getCurrentUser(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + principal.getName()));
        return new UserResponseDTO(user.getId(), user.getUsername(), user.getEmail());
    }

    @GetMapping("/search")
    public List<UserResponseDTO> searchUsers(@RequestParam String query, Principal principal) {
        if (query.length() < 2) return List.of();

        return userRepository.findByUsernameContainingIgnoreCaseAndUsernameNot(query, query)
                .stream()
                .filter(user -> !user.getUsername().equals(principal.getName()))
                .map(user -> new UserResponseDTO(user.getId(), user.getUsername(), user.getEmail()))
                .toList();
    }
}
