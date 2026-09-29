package com.paycore.service;

import com.paycore.dto.AuthResponse;
import com.paycore.dto.RegisterRequest;
import com.paycore.entity.User;
import com.paycore.exception.DuplicateResourceException;
import com.paycore.repository.UserRepository;
import com.paycore.repository.WalletRepository;
import com.paycore.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = new RegisterRequest();
        validRequest.setFullName("Rahul Sharma");
        validRequest.setEmail("rahul@example.com");
        validRequest.setPassword("Rahul@123");
        validRequest.setPhoneNumber("9876543210");
        validRequest.setAadhaarNumber("123456789012");
        validRequest.setDateOfBirth(LocalDate.of(1995, 5, 20));
        validRequest.setGender("Male");
        validRequest.setNationality("Indian");
        validRequest.setResidentialAddress("MG Road, Bangalore");
        validRequest.setBankAccountNumber("1234567890");
        validRequest.setOccupation("Software Engineer");
        validRequest.setTransactionPassword("123456");
    }

    @Test
    @DisplayName("Should successfully register a new customer with auto-generated customer ID and pending status")
    void testRegisterCustomerSuccess() {
        when(userRepository.existsByEmail("rahul@example.com")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("9876543210")).thenReturn(false);
        when(userRepository.count()).thenReturn(0L);
        when(passwordEncoder.encode(any())).thenReturn("hashed_value");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(10L);
            return u;
        });
        when(tokenProvider.generateTokenFromUsername(any())).thenReturn("mock_jwt_token");

        AuthResponse response = authService.registerCustomer(validRequest);

        assertNotNull(response);
        assertEquals("VERIFICATION_PENDING", response.getStatus());
        assertEquals("ROLE_CUSTOMER", response.getRole());
        assertEquals("mock_jwt_token", response.getToken());
        assertTrue(response.getCustomerId().startsWith("PAY"));
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException on duplicate email")
    void testRegisterDuplicateEmail() {
        when(userRepository.existsByEmail("rahul@example.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> {
            authService.registerCustomer(validRequest);
        });

        verify(userRepository, never()).save(any(User.class));
    }
}
