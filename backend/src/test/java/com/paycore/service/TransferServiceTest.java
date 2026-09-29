package com.paycore.service;

import com.paycore.dto.TransferRequest;
import com.paycore.dto.TransferResponse;
import com.paycore.entity.*;
import com.paycore.exception.AccountNotApprovedException;
import com.paycore.exception.InsufficientBalanceException;
import com.paycore.exception.InvalidTransactionPasswordException;
import com.paycore.exception.SelfTransferException;
import com.paycore.repository.TransactionRepository;
import com.paycore.repository.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransferServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private TransferService transferService;

    private User senderUser;
    private User receiverUser;
    private Wallet senderWallet;
    private Wallet receiverWallet;

    @BeforeEach
    void setUp() {
        senderUser = new User();
        senderUser.setId(1L);
        senderUser.setCustomerId("PAY100001");
        senderUser.setFullName("Rahul Sharma");
        senderUser.setStatus(AccountStatus.APPROVED);
        senderUser.setTransactionPasswordHash("hashed_123456");

        senderWallet = new Wallet();
        senderWallet.setId(10L);
        senderWallet.setAccountNumber("PAYWALLET100001");
        senderWallet.setUser(senderUser);
        senderWallet.setBalance(new BigDecimal("1000.00"));
        senderWallet.setStatus("ACTIVE");

        receiverUser = new User();
        receiverUser.setId(2L);
        receiverUser.setCustomerId("PAY100002");
        receiverUser.setFullName("Amit Sharma");
        receiverUser.setStatus(AccountStatus.APPROVED);

        receiverWallet = new Wallet();
        receiverWallet.setId(20L);
        receiverWallet.setAccountNumber("PAYWALLET100002");
        receiverWallet.setUser(receiverUser);
        receiverWallet.setBalance(new BigDecimal("500.00"));
        receiverWallet.setStatus("ACTIVE");
    }

    @Test
    @DisplayName("Should successfully transfer money between approved accounts with correct password and balance")
    void testSuccessfulTransfer() {
        TransferRequest request = new TransferRequest("PAYWALLET100002", new BigDecimal("400.00"), "123456", "Lunch payment");

        when(walletRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(senderWallet));
        when(passwordEncoder.matches("123456", "hashed_123456")).thenReturn(true);
        when(walletRepository.findByAccountNumberForUpdate("PAYWALLET100002")).thenReturn(Optional.of(receiverWallet));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction t = invocation.getArgument(0);
            t.setId(100L);
            return t;
        });

        TransferResponse response = transferService.transferMoney(1L, request);

        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());
        assertEquals(new BigDecimal("400.00"), response.getAmount());
        assertEquals(new BigDecimal("600.00"), senderWallet.getBalance());
        assertEquals(new BigDecimal("900.00"), receiverWallet.getBalance());
        verify(walletRepository, times(1)).save(senderWallet);
        verify(walletRepository, times(1)).save(receiverWallet);
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    @DisplayName("Should throw InsufficientBalanceException when requested amount exceeds sender balance")
    void testInsufficientBalance() {
        TransferRequest request = new TransferRequest("PAYWALLET100002", new BigDecimal("1500.00"), "123456", "Transfer test");

        when(walletRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(senderWallet));
        when(passwordEncoder.matches("123456", "hashed_123456")).thenReturn(true);
        when(walletRepository.findByAccountNumberForUpdate("PAYWALLET100002")).thenReturn(Optional.of(receiverWallet));

        InsufficientBalanceException ex = assertThrows(InsufficientBalanceException.class, () -> {
            transferService.transferMoney(1L, request);
        });

        assertTrue(ex.getMessage().contains("Insufficient balance"));
        assertEquals(new BigDecimal("1000.00"), senderWallet.getBalance());
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    @DisplayName("Should throw InvalidTransactionPasswordException on incorrect transaction password")
    void testInvalidTransactionPassword() {
        TransferRequest request = new TransferRequest("PAYWALLET100002", new BigDecimal("100.00"), "wrong_pwd", "Transfer test");

        when(walletRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(senderWallet));
        when(passwordEncoder.matches("wrong_pwd", "hashed_123456")).thenReturn(false);

        assertThrows(InvalidTransactionPasswordException.class, () -> {
            transferService.transferMoney(1L, request);
        });

        verify(walletRepository, never()).save(any(Wallet.class));
    }

    @Test
    @DisplayName("Should throw SelfTransferException when sender attempts to transfer to their own wallet")
    void testSelfTransfer() {
        TransferRequest request = new TransferRequest("PAYWALLET100001", new BigDecimal("100.00"), "123456", "Self transfer");

        when(walletRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(senderWallet));
        when(passwordEncoder.matches("123456", "hashed_123456")).thenReturn(true);

        assertThrows(SelfTransferException.class, () -> {
            transferService.transferMoney(1L, request);
        });
    }

    @Test
    @DisplayName("Should throw AccountNotApprovedException when sender is VERIFICATION_PENDING")
    void testPendingSenderTransfer() {
        senderUser.setStatus(AccountStatus.VERIFICATION_PENDING);
        TransferRequest request = new TransferRequest("PAYWALLET100002", new BigDecimal("100.00"), "123456", "Test");

        when(walletRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(senderWallet));

        assertThrows(AccountNotApprovedException.class, () -> {
            transferService.transferMoney(1L, request);
        });
    }
}
