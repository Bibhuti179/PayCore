package com.paycore.service;

import com.paycore.dto.TransferRequest;
import com.paycore.dto.TransferResponse;
import com.paycore.entity.*;
import com.paycore.exception.*;
import com.paycore.repository.TransactionRepository;
import com.paycore.repository.WalletRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
public class TransferService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;

    public TransferService(WalletRepository walletRepository,
                           TransactionRepository transactionRepository,
                           PasswordEncoder passwordEncoder) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public TransferResponse transferMoney(Long senderUserId, TransferRequest request) {
        // Find sender wallet with pessimistic lock
        Wallet senderWallet = walletRepository.findByUserIdForUpdate(senderUserId)
                .orElseThrow(() -> new WalletNotFoundException("Sender wallet not found"));

        User sender = senderWallet.getUser();

        // 1. Verify sender approval status
        if (sender.getStatus() != AccountStatus.APPROVED) {
            throw new AccountNotApprovedException("Your account is not approved for money transfers. Status: " + sender.getStatus());
        }

        // 2. Verify transaction password
        if (sender.getTransactionPasswordHash() == null ||
            !passwordEncoder.matches(request.getTransactionPassword(), sender.getTransactionPasswordHash())) {
            throw new InvalidTransactionPasswordException("Incorrect transaction password. Please verify and try again.");
        }

        // 3. Verify transfer amount
        BigDecimal amount = request.getAmount().setScale(2, RoundingMode.HALF_UP);
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transfer amount must be strictly greater than zero");
        }

        String receiverAccNo = request.getReceiverAccountNumber().trim().toUpperCase();

        // 4. Verify sender and receiver are not the same account
        if (senderWallet.getAccountNumber().equalsIgnoreCase(receiverAccNo)) {
            throw new SelfTransferException("Cannot transfer money to your own wallet account");
        }

        // 5. Find receiver wallet with pessimistic lock
        Wallet receiverWallet = walletRepository.findByAccountNumberForUpdate(receiverAccNo)
                .orElseThrow(() -> new WalletNotFoundException("Receiver wallet account " + receiverAccNo + " not found"));

        User receiver = receiverWallet.getUser();

        // 6. Verify receiver is an approved customer
        if (receiver.getStatus() != AccountStatus.APPROVED) {
            throw new AccountNotApprovedException("Cannot transfer to this account: Receiver account is not active or approved");
        }

        // 7. Verify sufficient balance
        if (senderWallet.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException(senderWallet.getBalance(), amount);
        }

        // 8. Atomic Debit & Credit using BigDecimal
        BigDecimal senderNewBalance = senderWallet.getBalance().subtract(amount);
        BigDecimal receiverNewBalance = receiverWallet.getBalance().add(amount);

        senderWallet.setBalance(senderNewBalance);
        receiverWallet.setBalance(receiverNewBalance);

        walletRepository.save(senderWallet);
        walletRepository.save(receiverWallet);

        // 9. Generate unique transaction reference (e.g. PCX8A92K72)
        String txnRef = "PCX" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();

        Transaction txn = new Transaction();
        txn.setTransactionReference(txnRef);
        txn.setType(TransactionType.TRANSFER);
        txn.setSenderWallet(senderWallet);
        txn.setReceiverWallet(receiverWallet);
        txn.setAmount(amount);
        txn.setStatus(TransactionStatus.SUCCESS);
        txn.setDescription(request.getDescription() != null && !request.getDescription().isBlank() ?
                request.getDescription().trim() : "Money Transfer to " + receiver.getFullName());

        Transaction savedTxn = transactionRepository.save(txn);

        // 10. Build TransferResponse
        TransferResponse response = new TransferResponse();
        response.setTransactionReference(savedTxn.getTransactionReference());
        response.setAmount(amount);
        response.setSenderAccountNumber(senderWallet.getAccountNumber());
        response.setSenderName(sender.getFullName());
        response.setReceiverAccountNumber(receiverWallet.getAccountNumber());
        response.setReceiverName(receiver.getFullName());
        response.setUpdatedBalance(senderNewBalance);
        response.setStatus(savedTxn.getStatus().name());
        response.setTimestamp(savedTxn.getCreatedAt());

        return response;
    }
}
