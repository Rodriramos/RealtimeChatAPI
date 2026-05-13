package com.realtimechat.backend.controllers;

import java.security.Principal;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
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
}
