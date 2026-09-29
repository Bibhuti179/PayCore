package com.paycore.dto;

import java.math.BigDecimal;

public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private Long id;
    private String customerId;
    private String fullName;
    private String email;
    private String role;
    private String status;
    private String walletAccountNumber;
    private BigDecimal balance;

    public AuthResponse() {}

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getWalletAccountNumber() { return walletAccountNumber; }
    public void setWalletAccountNumber(String walletAccountNumber) { this.walletAccountNumber = walletAccountNumber; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
}
