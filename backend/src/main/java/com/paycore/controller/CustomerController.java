package com.paycore.controller;

import com.paycore.dto.*;
import com.paycore.entity.TransactionType;
import com.paycore.security.UserPrincipal;
import com.paycore.service.CustomerService;
import com.paycore.service.DepositService;
import com.paycore.service.TransactionService;
import com.paycore.service.TransferService;
import com.paycore.service.WalletService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final CustomerService customerService;
    private final WalletService walletService;
    private final DepositService depositService;
    private final TransferService transferService;
    private final TransactionService transactionService;

    public CustomerController(CustomerService customerService,
                              WalletService walletService,
                              DepositService depositService,
                              TransferService transferService,
                              TransactionService transactionService) {
        this.customerService = customerService;
        this.walletService = walletService;
        this.depositService = depositService;
        this.transferService = transferService;
        this.transactionService = transactionService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<CustomerProfileResponse>> getProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        CustomerProfileResponse profile = customerService.getCustomerProfile(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", profile));
    }

    @GetMapping("/wallet")
    public ResponseEntity<ApiResponse<WalletResponse>> getWallet(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        WalletResponse wallet = walletService.getWalletByUserId(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Wallet details retrieved successfully", wallet));
    }

    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<Map<String, BigDecimal>>> getBalance(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        BigDecimal balance = walletService.getBalance(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Current balance retrieved", Map.of("balance", balance)));
    }

    @GetMapping("/receiver/{accountNumber}")
    public ResponseEntity<ApiResponse<ReceiverLookupResponse>> lookupReceiver(@PathVariable String accountNumber) {
        ReceiverLookupResponse response = customerService.lookupReceiver(accountNumber);
        return ResponseEntity.ok(ApiResponse.success("Receiver verified", response));
    }

    @PostMapping("/deposit")
    public ResponseEntity<ApiResponse<WalletResponse>> depositMoney(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody DepositRequest request) {
        WalletResponse updatedWallet = depositService.depositMoney(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Cash deposited successfully. New balance: ₹" + updatedWallet.getBalance(), updatedWallet));
    }

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<TransferResponse>> transferMoney(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody TransferRequest request) {
        TransferResponse response = transferService.transferMoney(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Transfer completed successfully", response));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getTransactions(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<TransactionResponse> transactions = transactionService.getCustomerTransactions(userPrincipal.getId(), type, pageRequest);
        return ResponseEntity.ok(ApiResponse.success("Transactions retrieved", transactions));
    }
}
