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
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import com.realtimechat.backend.controllers.UserController;
import com.realtimechat.backend.dtos.UpdateProfileResponseDTO;
import com.realtimechat.backend.dtos.UserResponseDTO;
import com.realtimechat.backend.entities.User;
import com.realtimechat.backend.exceptions.EmailAlreadyExistsException;
import com.realtimechat.backend.exceptions.UserNotFoundException;
import com.realtimechat.backend.exceptions.UsernameAlreadyExistsException;
import com.realtimechat.backend.repositories.UserRepository;
import com.realtimechat.backend.security.JwtUtil;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class UserControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private Principal principal;

    @InjectMocks
    private UserController userController;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("hashedpassword");

        when(principal.getName()).thenReturn("testuser");
    }

    @Test
    void testGetCurrentUser_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        UserResponseDTO result = userController.getCurrentUser(principal);

        assertNotNull(result);
        assertEquals("testuser", result.username());
        assertEquals("test@example.com", result.email());
        assertEquals(1L, result.id());
        verify(userRepository, times(1)).findByUsername("testuser");
    }

    @Test
    void testGetCurrentUser_UserNotFound() {
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());
        when(principal.getName()).thenReturn("nonexistent");

        assertThrows(UserNotFoundException.class, () ->
            userController.getCurrentUser(principal)
        );
    }

    @Test
    void testSearchUsers_Success() {
        User user2 = new User();
        user2.setId(2L);
        user2.setUsername("john");
        user2.setEmail("john@example.com");

        when(userRepository.findByUsernameContainingIgnoreCaseAndUsernameNot("jo", "jo"))
                .thenReturn(Arrays.asList(user2));

        List<UserResponseDTO> result = userController.searchUsers("jo", principal);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("john", result.get(0).username());
    }

    @Test
    void testSearchUsers_QueryTooShort() {
        List<UserResponseDTO> result = userController.searchUsers("a", principal);

        assertNotNull(result);
        assertEquals(0, result.size());
        verify(userRepository, never()).findByUsernameContainingIgnoreCaseAndUsernameNot(anyString(), anyString());
    }

    @Test
    void testSearchUsers_ExcludeCurrentUser() {
        User user2 = new User();
        user2.setId(2L);
        user2.setUsername("testuser");
        user2.setEmail("test@example.com");

        when(userRepository.findByUsernameContainingIgnoreCaseAndUsernameNot("test", "test"))
                .thenReturn(Arrays.asList(user2));

        List<UserResponseDTO> result = userController.searchUsers("test", principal);

        assertEquals(0, result.size());
    }

    @Test
    void testSearchUsers_MultipleResults() {
        User user2 = new User();
        user2.setId(2L);
        user2.setUsername("john");
        user2.setEmail("john@example.com");

        User user3 = new User();
        user3.setId(3L);
        user3.setUsername("jane");
        user3.setEmail("jane@example.com");

        when(userRepository.findByUsernameContainingIgnoreCaseAndUsernameNot("ja", "ja"))
                .thenReturn(Arrays.asList(user2, user3));

        List<UserResponseDTO> result = userController.searchUsers("ja", principal);

        assertEquals(2, result.size());
    }

    @Test
    void testSearchUsers_CaseInsensitive() {
        User user2 = new User();
        user2.setId(2L);
        user2.setUsername("John");
        user2.setEmail("john@example.com");

        when(userRepository.findByUsernameContainingIgnoreCaseAndUsernameNot("john", "john"))
                .thenReturn(Arrays.asList(user2));

        List<UserResponseDTO> result = userController.searchUsers("john", principal);

        assertEquals(1, result.size());
        assertEquals("John", result.get(0).username());
    }

    @Test
    void testUpdateUser_EmailChange_Success() {
        User updatedUser = new User();
        updatedUser.setEmail("newemail@example.com");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(userRepository.existsByEmail("newemail@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtUtil.generateToken(testUser)).thenReturn("new_token");

        UpdateProfileResponseDTO result = userController.updateUser(updatedUser, principal);

        assertNotNull(result);
        verify(userRepository, times(1)).save(any(User.class));
        verify(jwtUtil, times(1)).generateToken(testUser);
    }

    @Test
    void testUpdateUser_EmailAlreadyExists() {
        User updatedUser = new User();
        updatedUser.setEmail("existing@example.com");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThrows(EmailAlreadyExistsException.class, () ->
            userController.updateUser(updatedUser, principal)
        );
        verify(userRepository, never()).save(any());
    }

    @Test
    void testUpdateUser_UsernameChange_Success() {
        User updatedUser = new User();
        updatedUser.setUsername("newusername");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(userRepository.existsByUsername("newusername")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtUtil.generateToken(testUser)).thenReturn("new_token");

        UpdateProfileResponseDTO result = userController.updateUser(updatedUser, principal);

        assertNotNull(result);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testUpdateUser_UsernameAlreadyExists() {
        User updatedUser = new User();
        updatedUser.setUsername("existinguser");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        assertThrows(UsernameAlreadyExistsException.class, () ->
            userController.updateUser(updatedUser, principal)
        );
    }

    @Test
    void testUpdateUser_BothEmailAndUsername() {
        User updatedUser = new User();
        updatedUser.setEmail("newemail@example.com");
        updatedUser.setUsername("newusername");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(userRepository.existsByEmail("newemail@example.com")).thenReturn(false);
        when(userRepository.existsByUsername("newusername")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtUtil.generateToken(testUser)).thenReturn("new_token");

        UpdateProfileResponseDTO result = userController.updateUser(updatedUser, principal);

        assertNotNull(result);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testUpdateUser_SameEmail() {
        User updatedUser = new User();
        updatedUser.setEmail("test@example.com");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtUtil.generateToken(testUser)).thenReturn("new_token");

        UpdateProfileResponseDTO result = userController.updateUser(updatedUser, principal);

        assertNotNull(result);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testUpdateUser_UserNotFound() {
        User updatedUser = new User();
        updatedUser.setEmail("newemail@example.com");

        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());
        when(principal.getName()).thenReturn("nonexistent");

        assertThrows(UserNotFoundException.class, () ->
            userController.updateUser(updatedUser, principal)
        );
    }

    @Test
    void testUpdatePassword_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        String result = userController.updatePassword("newpassword", principal);

        assertNotNull(result);
        assertTrue(result.contains("updated"));
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void testUpdatePassword_UserNotFound() {
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());
        when(principal.getName()).thenReturn("nonexistent");

        assertThrows(UserNotFoundException.class, () ->
            userController.updatePassword("newpassword", principal)
        );
        verify(userRepository, never()).save(any());
    }

    @Test
    void testDeleteUser_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        String result = userController.deleteUser(principal);

        assertNotNull(result);
        assertTrue(result.contains("deleted"));
        verify(userRepository, times(1)).delete(testUser);
    }

    @Test
    void testDeleteUser_UserNotFound() {
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());
        when(principal.getName()).thenReturn("nonexistent");

        assertThrows(UserNotFoundException.class, () ->
            userController.deleteUser(principal)
        );
        verify(userRepository, never()).delete(any());
    }

    @Test
    void testUpdateUser_NullEmail() {
        User updatedUser = new User();
        updatedUser.setEmail(null);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtUtil.generateToken(testUser)).thenReturn("new_token");

        UpdateProfileResponseDTO result = userController.updateUser(updatedUser, principal);

        assertNotNull(result);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testSearchUsers_EmptyQuery() {
        List<UserResponseDTO> result = userController.searchUsers("", principal);

        assertEquals(0, result.size());
        verify(userRepository, never()).findByUsernameContainingIgnoreCaseAndUsernameNot(anyString(), anyString());
    }
}
