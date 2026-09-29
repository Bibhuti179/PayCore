package com.paycore.service;

import com.paycore.dto.DepositRequest;
import com.paycore.dto.WalletResponse;
import com.paycore.entity.*;
import com.paycore.exception.AccountNotApprovedException;
import com.paycore.exception.WalletNotFoundException;
import com.paycore.repository.TransactionRepository;
import com.paycore.repository.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
public class DepositService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    public DepositService(WalletRepository walletRepository, TransactionRepository transactionRepository) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public WalletResponse depositMoney(Long userId, DepositRequest request) {
        Wallet wallet = walletRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new WalletNotFoundException("Active wallet not found for user."));

        User user = wallet.getUser();
        if (user.getStatus() != AccountStatus.APPROVED) {
            throw new AccountNotApprovedException("Cannot perform cash deposit. Your account is " + user.getStatus());
        }

        BigDecimal amount = request.getAmount().setScale(2, RoundingMode.HALF_UP);
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Deposit amount must be strictly greater than zero");
        }

        // Increase wallet balance
        BigDecimal previousBalance = wallet.getBalance();
        BigDecimal newBalance = previousBalance.add(amount);
        wallet.setBalance(newBalance);
        Wallet savedWallet = walletRepository.save(wallet);

        // Generate unique transaction reference: PCX8A92K72
        String reference = "PCX" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();

        Transaction txn = new Transaction();
        txn.setTransactionReference(reference);
        txn.setType(TransactionType.DEPOSIT);
        txn.setSenderWallet(null); // Null for direct cash deposit
        txn.setReceiverWallet(savedWallet);
        txn.setAmount(amount);
        txn.setStatus(TransactionStatus.SUCCESS);
        txn.setDescription(request.getDescription() != null && !request.getDescription().isBlank() ?
                request.getDescription().trim() : "Cash Deposit via PayCore Cash Services");

        transactionRepository.save(txn);

        WalletResponse response = new WalletResponse();
        response.setId(savedWallet.getId());
        response.setAccountNumber(savedWallet.getAccountNumber());
        response.setCustomerId(user.getCustomerId());
        response.setCustomerName(user.getFullName());
        response.setBalance(savedWallet.getBalance());
        response.setStatus(savedWallet.getStatus());
        response.setUpdatedAt(savedWallet.getUpdatedAt());

        return response;
    }
}
