package com.realtimechat.backend.controllers;

import java.security.Principal;
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realtimechat.backend.dtos.UpdateProfileResponseDTO;
import com.realtimechat.backend.dtos.UserResponseDTO;
import com.realtimechat.backend.entities.User;
import com.realtimechat.backend.exceptions.EmailAlreadyExistsException;
import com.realtimechat.backend.exceptions.UserNotFoundException;
import com.realtimechat.backend.exceptions.UsernameAlreadyExistsException;
import com.realtimechat.backend.repositories.UserRepository;
import com.realtimechat.backend.security.JwtUtil;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @GetMapping("/me")
    public UserResponseDTO getCurrentUser(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + principal.getName()));
        return new UserResponseDTO(user.getId(), user.getUsername(), user.getEmail());
    }

    @GetMapping("/search")
    public List<UserResponseDTO> searchUsers(@RequestParam String query, Principal principal) {
        if (query.length() < 2)
            return List.of();

        return userRepository.findByUsernameContainingIgnoreCaseAndUsernameNot(query, query)
                .stream()
                .filter(user -> !user.getUsername().equals(principal.getName()))
                .map(user -> new UserResponseDTO(user.getId(), user.getUsername(), user.getEmail()))
                .toList();
    }

    @PostMapping("/update")
    public UpdateProfileResponseDTO updateUser(@RequestBody User updatedUser, Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + principal.getName()));

        if (updatedUser.getEmail() != null && !updatedUser.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(updatedUser.getEmail())) {
                throw new EmailAlreadyExistsException("Email is already in use");
            }
            user.setEmail(updatedUser.getEmail());
        }

        if (updatedUser.getUsername() != null && !updatedUser.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(updatedUser.getUsername())) {
                throw new UsernameAlreadyExistsException("Username is already taken");
            }
            user.setUsername(updatedUser.getUsername());
        }

        User savedUser = userRepository.save(user);
        String nuevoToken = jwtUtil.generateToken(savedUser);

        UserResponseDTO userDto = new UserResponseDTO(savedUser.getId(), savedUser.getUsername(), savedUser.getEmail());
        return new UpdateProfileResponseDTO(userDto, nuevoToken);
    }

    @PatchMapping("/update-password")
    public String updatePassword(@RequestBody String newPassword, Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + principal.getName()));
        user.setPassword(newPassword);
        userRepository.save(user);
        return "Password updated successfully";
    }

    @DeleteMapping("/delete")
    public String deleteUser(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + principal.getName()));
        userRepository.delete(user);
        return "User deleted successfully";
    }
}
