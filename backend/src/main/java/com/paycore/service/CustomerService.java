package com.paycore.service;

import com.paycore.dto.CustomerProfileResponse;
import com.paycore.dto.ReceiverLookupResponse;
import com.paycore.entity.AccountStatus;
import com.paycore.entity.User;
import com.paycore.entity.Wallet;
import com.paycore.exception.AccountNotApprovedException;
import com.paycore.exception.UserNotFoundException;
import com.paycore.exception.WalletNotFoundException;
import com.paycore.repository.UserRepository;
import com.paycore.repository.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class CustomerService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;

    public CustomerService(UserRepository userRepository, WalletRepository walletRepository) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
    }

    @Transactional(readOnly = true)
    public CustomerProfileResponse getCustomerProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Customer not found with id: " + userId));

        CustomerProfileResponse profile = new CustomerProfileResponse();
        profile.setId(user.getId());
        profile.setCustomerId(user.getCustomerId());
        profile.setFullName(user.getFullName());
        profile.setEmail(user.getEmail());
        profile.setPhoneNumber(user.getPhoneNumber());
        profile.setAadhaarMasked(user.getAadhaarMasked());
        profile.setDateOfBirth(user.getDateOfBirth());
        profile.setGender(user.getGender());
        profile.setNationality(user.getNationality());
        profile.setResidentialAddress(user.getResidentialAddress());
        profile.setBankAccountNumberMasked(user.getBankAccountNumberMasked());
        profile.setOccupation(user.getOccupation());
        profile.setStatus(user.getStatus().name());
        profile.setCreatedAt(user.getCreatedAt());

        walletRepository.findByUserId(user.getId()).ifPresent(w -> {
            profile.setWalletAccountNumber(w.getAccountNumber());
            profile.setBalance(w.getBalance());
        });

        if (profile.getBalance() == null) {
            profile.setBalance(BigDecimal.ZERO.setScale(2));
        }

        return profile;
    }

    @Transactional(readOnly = true)
    public ReceiverLookupResponse lookupReceiver(String accountNumber) {
        String cleanAccNo = accountNumber.trim().toUpperCase();

        Wallet wallet = walletRepository.findByAccountNumber(cleanAccNo)
                .orElseThrow(() -> new WalletNotFoundException("Wallet account " + cleanAccNo + " not found"));

        User user = wallet.getUser();
        if (user.getStatus() != AccountStatus.APPROVED) {
            throw new AccountNotApprovedException("Receiver account exists but is currently " + user.getStatus());
        }

        return new ReceiverLookupResponse(wallet.getAccountNumber(), user.getFullName(), true);
    }
}
