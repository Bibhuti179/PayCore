package com.paycore.service;

import com.paycore.dto.TransactionResponse;
import com.paycore.entity.Transaction;
import com.paycore.entity.TransactionType;
import com.paycore.entity.Wallet;
import com.paycore.exception.WalletNotFoundException;
import com.paycore.repository.TransactionRepository;
import com.paycore.repository.WalletRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;

    public TransactionService(TransactionRepository transactionRepository, WalletRepository walletRepository) {
        this.transactionRepository = transactionRepository;
        this.walletRepository = walletRepository;
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getCustomerTransactions(Long userId, TransactionType type, Pageable pageable) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found for customer ID: " + userId));

        Page<Transaction> transactions;
        if (type != null) {
            transactions = transactionRepository.findByWalletInvolvedAndType(wallet, type, pageable);
        } else {
            transactions = transactionRepository.findByWalletInvolved(wallet, pageable);
        }

        return transactions.map(txn -> mapToCustomerTransactionResponse(txn, wallet));
    }

    private TransactionResponse mapToCustomerTransactionResponse(Transaction txn, Wallet myWallet) {
        TransactionResponse res = new TransactionResponse();
        res.setId(txn.getId());
        res.setTransactionReference(txn.getTransactionReference());
        res.setType(txn.getType().name());
        res.setAmount(txn.getAmount());
        res.setStatus(txn.getStatus().name());
        res.setFailureReason(txn.getFailureReason());
        res.setDescription(txn.getDescription());
        res.setCreatedAt(txn.getCreatedAt());

        if (txn.getSenderWallet() != null) {
            res.setFromAccount(txn.getSenderWallet().getAccountNumber());
            res.setFromCustomerName(txn.getSenderWallet().getUser().getFullName());
        }

        if (txn.getReceiverWallet() != null) {
            res.setToAccount(txn.getReceiverWallet().getAccountNumber());
            res.setToCustomerName(txn.getReceiverWallet().getUser().getFullName());
        }

        // Determine Direction
        if (txn.getType() == TransactionType.DEPOSIT) {
            res.setDirection("SELF_DEPOSIT");
        } else if (txn.getSenderWallet() != null && txn.getSenderWallet().getId().equals(myWallet.getId())) {
            res.setDirection("SENT");
        } else {
            res.setDirection("RECEIVED");
        }

        return res;
    }
}
