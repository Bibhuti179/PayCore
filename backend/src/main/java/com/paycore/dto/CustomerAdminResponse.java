package com.paycore.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class CustomerAdminResponse {
    private Long id;
    private String customerId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String aadhaarMasked;
    private LocalDate dateOfBirth;
    private String gender;
    private String nationality;
    private String residentialAddress;
    private String bankAccountNumberMasked;
    private String occupation;
    private String walletAccountNumber;
    private BigDecimal walletBalance;
    private String status;
    private LocalDateTime registrationDate;

    public CustomerAdminResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getAadhaarMasked() { return aadhaarMasked; }
    public void setAadhaarMasked(String aadhaarMasked) { this.aadhaarMasked = aadhaarMasked; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }

    public String getResidentialAddress() { return residentialAddress; }
    public void setResidentialAddress(String residentialAddress) { this.residentialAddress = residentialAddress; }

    public String getBankAccountNumberMasked() { return bankAccountNumberMasked; }
    public void setBankAccountNumberMasked(String bankAccountNumberMasked) { this.bankAccountNumberMasked = bankAccountNumberMasked; }

    public String getOccupation() { return occupation; }
    public void setOccupation(String occupation) { this.occupation = occupation; }

    public String getWalletAccountNumber() { return walletAccountNumber; }
    public void setWalletAccountNumber(String walletAccountNumber) { this.walletAccountNumber = walletAccountNumber; }

    public BigDecimal getWalletBalance() { return walletBalance; }
    public void setWalletBalance(BigDecimal walletBalance) { this.walletBalance = walletBalance; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(LocalDateTime registrationDate) { this.registrationDate = registrationDate; }
}
