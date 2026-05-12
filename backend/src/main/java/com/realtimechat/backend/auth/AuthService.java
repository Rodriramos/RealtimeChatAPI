package com.realtimechat.backend.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.realtimechat.backend.dtos.LoginDTO;
import com.realtimechat.backend.entities.RegisterRequest;
import com.realtimechat.backend.entities.User;
import com.realtimechat.backend.repositories.UserRepository;
import com.realtimechat.backend.security.JwtUtil;

import com.realtimechat.backend.exceptions.EmailAlreadyExistsException;
import com.realtimechat.backend.exceptions.PasswordMismatchException;
import com.realtimechat.backend.exceptions.UserNotFoundException;
import com.realtimechat.backend.exceptions.UsernameAlreadyExistsException;
import com.realtimechat.backend.exceptions.InvalidPasswordException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public String RegisterUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UsernameAlreadyExistsException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new PasswordMismatchException("Passwords do not match");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .provider("LOCAL")
                .build();

        return jwtUtil.generateToken(userRepository.save(user));
    }

    public String LoginUser(LoginDTO request) {
        User user = userRepository.findByUsernameOrEmail(request.getUsername(), request.getUsername())
                .orElseThrow(() -> new UserNotFoundException(request.getUsername()));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidPasswordException("Invalid password");
        }

        return jwtUtil.generateToken(user);
    }
}
