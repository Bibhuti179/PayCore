package com.paycore.config;

import com.paycore.entity.AccountStatus;
import com.paycore.entity.Role;
import com.paycore.entity.User;
import com.paycore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${paycore.admin.username:admin}")
    private String adminUsername;

    @Value("${paycore.admin.password:admin}")
    private String adminPassword;

    @Value("${paycore.admin.email:admin@paycore.com}")
    private String adminEmail;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Initialize default administrator account if not present
        if (userRepository.findByCustomerId(adminUsername).isEmpty() &&
            userRepository.findByEmail(adminEmail).isEmpty()) {

            User admin = new User();
            admin.setCustomerId(adminUsername);
            admin.setFullName("PayCore System Administrator");
            admin.setEmail(adminEmail);
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            admin.setPhoneNumber("9999999999");
            admin.setAadhaarNumberHash(passwordEncoder.encode("000000000000"));
            admin.setAadhaarMasked("XXXX XXXX 0000");
            admin.setDateOfBirth(LocalDate.of(1990, 1, 1));
            admin.setGender("Other");
            admin.setNationality("Indian");
            admin.setResidentialAddress("PayCore HQ Financial Towers, Level 14");
            admin.setBankAccountNumberMasked("XXXXXX0000");
            admin.setOccupation("System Administrator");
            admin.setTransactionPasswordHash(passwordEncoder.encode("admin"));
            admin.setRole(Role.ROLE_ADMIN);
            admin.setStatus(AccountStatus.APPROVED);

            userRepository.save(admin);
            System.out.println("PayCore Admin initialized successfully. Username: " + adminUsername);
        }
    }
}
