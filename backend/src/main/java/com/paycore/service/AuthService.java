package com.paycore.service;

import com.paycore.dto.AuthResponse;
import com.paycore.dto.LoginRequest;
import com.paycore.dto.RegisterRequest;
import com.paycore.entity.AccountStatus;
import com.paycore.entity.Role;
import com.paycore.entity.User;
import com.paycore.entity.Wallet;
import com.paycore.exception.DuplicateResourceException;
import com.paycore.exception.UserNotFoundException;
import com.paycore.repository.UserRepository;
import com.paycore.repository.WalletRepository;
import com.paycore.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       WalletRepository walletRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse registerCustomer(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("An account with email " + request.getEmail() + " already exists.");
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new DuplicateResourceException("An account with phone number " + request.getPhoneNumber() + " already exists.");
        }

        // Generate unique customer ID: PAY100001
        long count = userRepository.count();
        String customerId = String.format("PAY%06d", 100001 + count);
        while (userRepository.findByCustomerId(customerId).isPresent()) {
            count++;
            customerId = String.format("PAY%06d", 100001 + count);
        }

        // Mask Aadhaar: e.g. XXXX XXXX 1234
        String cleanAadhaar = request.getAadhaarNumber().replaceAll("\\s+", "");
        String aadhaarMasked = "XXXX XXXX " + cleanAadhaar.substring(Math.max(0, cleanAadhaar.length() - 4));

        // Mask Bank Account: e.g. XXXXXX7890
        String cleanBank = request.getBankAccountNumber().trim();
        String bankMasked = "XXXXXX" + cleanBank.substring(Math.max(0, cleanBank.length() - 4));

        User user = new User();
        user.setCustomerId(customerId);
        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber().trim());
        user.setAadhaarNumberHash(passwordEncoder.encode(cleanAadhaar));
        user.setAadhaarMasked(aadhaarMasked);
        user.setDateOfBirth(request.getDateOfBirth());
        user.setGender(request.getGender());
        user.setNationality(request.getNationality().trim());
        user.setResidentialAddress(request.getResidentialAddress().trim());
        user.setBankAccountNumberMasked(bankMasked);
        user.setOccupation(request.getOccupation().trim());
        user.setTransactionPasswordHash(passwordEncoder.encode(request.getTransactionPassword()));
        user.setRole(Role.ROLE_CUSTOMER);
        user.setStatus(AccountStatus.VERIFICATION_PENDING);

        User savedUser = userRepository.save(user);

        // Generate JWT token
        String token = tokenProvider.generateTokenFromUsername(savedUser.getCustomerId());

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setId(savedUser.getId());
        response.setCustomerId(savedUser.getCustomerId());
        response.setFullName(savedUser.getFullName());
        response.setEmail(savedUser.getEmail());
        response.setRole(savedUser.getRole().name());
        response.setStatus(savedUser.getStatus().name());
        response.setBalance(BigDecimal.ZERO.setScale(2));

        return response;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getUsername().trim();
        User user = userRepository.findByCustomerIdOrEmail(identifier, identifier)
                .orElseThrow(() -> new BadCredentialsException("Invalid username/customer ID or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username/customer ID or password");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getCustomerId(), request.getPassword())
        );

        String token = tokenProvider.generateToken(authentication);

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setId(user.getId());
        response.setCustomerId(user.getCustomerId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());
        response.setStatus(user.getStatus().name());

        Optional<Wallet> walletOpt = walletRepository.findByUserId(user.getId());
        if (walletOpt.isPresent()) {
            Wallet wallet = walletOpt.get();
            response.setWalletAccountNumber(wallet.getAccountNumber());
            response.setBalance(wallet.getBalance());
        } else {
            response.setBalance(BigDecimal.ZERO.setScale(2));
        }

        return response;
    }

    @Transactional(readOnly = true)
    public AuthResponse adminLogin(LoginRequest request) {
        String identifier = request.getUsername().trim();
        User admin = userRepository.findByCustomerIdOrEmail(identifier, identifier)
                .orElseThrow(() -> new BadCredentialsException("Invalid administrator credentials"));

        if (admin.getRole() != Role.ROLE_ADMIN) {
            throw new BadCredentialsException("Access denied: Not an administrator account");
        }

        if (!passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
            throw new BadCredentialsException("Invalid administrator credentials");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(admin.getCustomerId(), request.getPassword())
        );

        String token = tokenProvider.generateToken(authentication);

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setId(admin.getId());
        response.setCustomerId(admin.getCustomerId());
        response.setFullName(admin.getFullName());
        response.setEmail(admin.getEmail());
        response.setRole(admin.getRole().name());
        response.setStatus(admin.getStatus().name());

        return response;
    }
}
