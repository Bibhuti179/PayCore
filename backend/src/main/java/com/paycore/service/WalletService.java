package com.paycore.service;

import com.paycore.dto.WalletResponse;
import com.paycore.entity.User;
import com.paycore.entity.Wallet;
import com.paycore.exception.WalletNotFoundException;
import com.paycore.repository.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class WalletService {

    private final WalletRepository walletRepository;

    public WalletService(WalletRepository walletRepository) {
        this.walletRepository = walletRepository;
    }

    @Transactional
    public Wallet createWalletForUser(User user) {
        return walletRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    long count = walletRepository.count();
                    String accountNumber = String.format("PAYWALLET%06d", 100001 + count);
                    while (walletRepository.findByAccountNumber(accountNumber).isPresent()) {
                        count++;
                        accountNumber = String.format("PAYWALLET%06d", 100001 + count);
                    }

                    Wallet wallet = new Wallet();
                    wallet.setAccountNumber(accountNumber);
                    wallet.setUser(user);
                    wallet.setBalance(BigDecimal.ZERO.setScale(2));
                    wallet.setStatus("ACTIVE");
                    return walletRepository.save(wallet);
                });
    }

    @Transactional(readOnly = true)
    public WalletResponse getWalletByUserId(Long userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found for customer ID: " + userId));

        WalletResponse response = new WalletResponse();
        response.setId(wallet.getId());
        response.setAccountNumber(wallet.getAccountNumber());
        response.setCustomerId(wallet.getUser().getCustomerId());
        response.setCustomerName(wallet.getUser().getFullName());
        response.setBalance(wallet.getBalance());
        response.setStatus(wallet.getStatus());
        response.setUpdatedAt(wallet.getUpdatedAt());

        return response;
    }

    @Transactional(readOnly = true)
    public BigDecimal getBalance(Long userId) {
        return walletRepository.findByUserId(userId)
                .map(Wallet::getBalance)
                .orElse(BigDecimal.ZERO.setScale(2));
    }
}
