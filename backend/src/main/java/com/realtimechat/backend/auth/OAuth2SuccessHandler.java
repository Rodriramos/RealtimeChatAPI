package com.realtimechat.backend.auth;

import java.io.IOException;
import java.net.http.HttpClient;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.realtimechat.backend.entities.User;
import com.realtimechat.backend.repositories.UserRepository;
import com.realtimechat.backend.security.JwtUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public OAuth2SuccessHandler(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, 
                                        HttpServletResponse response, 
                                        Authentication authentication) throws IOException, ServletException {
        // Extract user details from the authentication object
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");
        
        if (email == null) {
            throw new RuntimeException("Email not found from OAuth2 provider");
        }

        // Get the provider (e.g., Google, Facebook) from the authentication token
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        String provider = oauthToken.getAuthorizedClientRegistrationId().toUpperCase();

        // Check if the user already exists in the database
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(email)
                            .username(oauthUser.getName())
                            .provider(provider)
                            .build();
                    return userRepository.save(newUser);
                });

        // Generate JWT token for the authenticated user
        String token = jwtUtil.generateToken(user);

        // Redirect to the frontend with the JWT token as a query parameter
        getRedirectStrategy().sendRedirect(request, response, "http://localhost:3000/oauth2/redirect?token=" + token);
    }
}
