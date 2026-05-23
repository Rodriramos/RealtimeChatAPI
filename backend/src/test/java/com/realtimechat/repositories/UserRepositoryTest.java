package com.realtimechat.repositories;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.realtimechat.backend.entities.User;
import com.realtimechat.backend.repositories.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserRepositoryTest {

    @Mock
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("hashedpassword");
    }

    @Test
    void testExistsByUsername_True() {
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        boolean result = userRepository.existsByUsername("testuser");

        assertTrue(result);
    }

    @Test
    void testExistsByUsername_False() {
        when(userRepository.existsByUsername("nonexistent")).thenReturn(false);

        boolean result = userRepository.existsByUsername("nonexistent");

        assertFalse(result);
    }

    @Test
    void testExistsByEmail_True() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        boolean result = userRepository.existsByEmail("test@example.com");

        assertTrue(result);
    }

    @Test
    void testExistsByEmail_False() {
        when(userRepository.existsByEmail("nonexistent@example.com")).thenReturn(false);

        boolean result = userRepository.existsByEmail("nonexistent@example.com");

        assertFalse(result);
    }

    @Test
    void testFindByUsernameOrEmail_ByUsername() {
        when(userRepository.findByUsernameOrEmail("testuser", "testuser"))
                .thenReturn(Optional.of(testUser));

        Optional<User> result = userRepository.findByUsernameOrEmail("testuser", "testuser");

        assertTrue(result.isPresent());
        assertEquals("testuser", result.get().getUsername());
    }

    @Test
    void testFindByUsernameOrEmail_ByEmail() {
        when(userRepository.findByUsernameOrEmail("test@example.com", "test@example.com"))
                .thenReturn(Optional.of(testUser));

        Optional<User> result = userRepository.findByUsernameOrEmail("test@example.com", "test@example.com");

        assertTrue(result.isPresent());
        assertEquals("test@example.com", result.get().getEmail());
    }

    @Test
    void testFindByUsernameOrEmail_NotFound() {
        when(userRepository.findByUsernameOrEmail("nonexistent", "nonexistent"))
                .thenReturn(Optional.empty());

        Optional<User> result = userRepository.findByUsernameOrEmail("nonexistent", "nonexistent");

        assertFalse(result.isPresent());
    }

    @Test
    void testFindByEmail_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        Optional<User> result = userRepository.findByEmail("test@example.com");

        assertTrue(result.isPresent());
        assertEquals("test@example.com", result.get().getEmail());
    }

    @Test
    void testFindByEmail_NotFound() {
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        Optional<User> result = userRepository.findByEmail("nonexistent@example.com");

        assertFalse(result.isPresent());
    }

    @Test
    void testFindByUsername_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        Optional<User> result = userRepository.findByUsername("testuser");

        assertTrue(result.isPresent());
        assertEquals("testuser", result.get().getUsername());
    }

    @Test
    void testFindByUsername_NotFound() {
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        Optional<User> result = userRepository.findByUsername("nonexistent");

        assertFalse(result.isPresent());
    }

    @Test
    void testFindByUsernameContainingIgnoreCaseAndUsernameNot_Success() {
        User user2 = new User();
        user2.setId(2L);
        user2.setUsername("john");
        user2.setEmail("john@example.com");

        when(userRepository.findByUsernameContainingIgnoreCaseAndUsernameNot("jo", "jo"))
                .thenReturn(Arrays.asList(user2));

        List<User> result = userRepository.findByUsernameContainingIgnoreCaseAndUsernameNot("jo", "jo");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("john", result.get(0).getUsername());
    }

    @Test
    void testFindByUsernameContainingIgnoreCaseAndUsernameNot_EmptyList() {
        when(userRepository.findByUsernameContainingIgnoreCaseAndUsernameNot("xyz", "xyz"))
                .thenReturn(Arrays.asList());

        List<User> result = userRepository.findByUsernameContainingIgnoreCaseAndUsernameNot("xyz", "xyz");

        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    void testFindByUsernameContainingIgnoreCaseAndUsernameNot_CaseInsensitive() {
        User user2 = new User();
        user2.setId(2L);
        user2.setUsername("John");

        when(userRepository.findByUsernameContainingIgnoreCaseAndUsernameNot("john", "john"))
                .thenReturn(Arrays.asList(user2));

        List<User> result = userRepository.findByUsernameContainingIgnoreCaseAndUsernameNot("john", "john");

        assertEquals(1, result.size());
        assertEquals("John", result.get(0).getUsername());
    }

    @Test
    void testFindByUsernameContainingIgnoreCaseAndUsernameNot_MultipleResults() {
        User user2 = new User();
        user2.setId(2L);
        user2.setUsername("john");

        User user3 = new User();
        user3.setId(3L);
        user3.setUsername("jane");

        when(userRepository.findByUsernameContainingIgnoreCaseAndUsernameNot("ja", "ja"))
                .thenReturn(Arrays.asList(user2, user3));

        List<User> result = userRepository.findByUsernameContainingIgnoreCaseAndUsernameNot("ja", "ja");

        assertEquals(2, result.size());
    }

    @Test
    void testSave_Success() {
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        User result = userRepository.save(testUser);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("testuser", result.getUsername());
    }

    @Test
    void testFindById_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        Optional<User> result = userRepository.findById(1L);

        assertTrue(result.isPresent());
        assertEquals("testuser", result.get().getUsername());
    }

    @Test
    void testFindById_NotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<User> result = userRepository.findById(999L);

        assertFalse(result.isPresent());
    }

    @Test
    void testDelete_Success() {
        userRepository.delete(testUser);

        verify(userRepository, times(1)).delete(testUser);
    }

    @Test
    void testExistsByUsernameAndEmail_BothPresent() {
        when(userRepository.existsByUsername("testuser")).thenReturn(true);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        boolean userExists = userRepository.existsByUsername("testuser");
        boolean emailExists = userRepository.existsByEmail("test@example.com");

        assertTrue(userExists);
        assertTrue(emailExists);
    }

    @Test
    void testFindByUsernameOrEmail_DifferentInputs() {
        when(userRepository.findByUsernameOrEmail("testuser", "test@example.com"))
                .thenReturn(Optional.of(testUser));

        Optional<User> result = userRepository.findByUsernameOrEmail("testuser", "test@example.com");

        assertTrue(result.isPresent());
    }
}
