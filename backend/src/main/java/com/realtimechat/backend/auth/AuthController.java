package com.realtimechat.backend.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realtimechat.backend.dtos.AuthResponseDTO;
import com.realtimechat.backend.dtos.LoginDTO;
import com.realtimechat.backend.entities.RegisterRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequest request) {
        String token = authService.RegisterUser(request);
        return ResponseEntity.ok(new AuthResponseDTO(token));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginDTO request) {
        String token = authService.LoginUser(request);
        return ResponseEntity.ok(new AuthResponseDTO(token));
    }
}
