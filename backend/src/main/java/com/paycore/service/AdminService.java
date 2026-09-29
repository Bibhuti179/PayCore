package com.paycore.service;

import com.paycore.dto.AdminDashboardResponse;
import com.paycore.dto.CustomerAdminResponse;
import com.paycore.dto.TransactionAdminResponse;
import com.paycore.entity.*;
import com.paycore.exception.UserNotFoundException;
import com.paycore.repository.TransactionRepository;
import com.paycore.repository.UserRepository;
import com.paycore.repository.WalletRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final WalletService walletService;

    public AdminService(UserRepository userRepository,
                        WalletRepository walletRepository,
                        TransactionRepository transactionRepository,
                        WalletService walletService) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.walletService = walletService;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        AdminDashboardResponse response = new AdminDashboardResponse();
        response.setTotalCustomers(userRepository.countByRole(Role.ROLE_CUSTOMER));
        response.setApprovedCustomers(userRepository.countByStatus(AccountStatus.APPROVED));
        response.setPendingCustomers(userRepository.countByStatus(AccountStatus.VERIFICATION_PENDING));
        response.setRejectedCustomers(userRepository.countByStatus(AccountStatus.REJECTED));
        response.setSuspendedCustomers(userRepository.countByStatus(AccountStatus.SUSPENDED));

        response.setTotalWallets(walletRepository.countByStatus("ACTIVE"));
        response.setTotalSystemBalance(walletRepository.sumTotalSystemBalance());

        response.setTotalTransactions(transactionRepository.count());
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        response.setTodayTransactions(transactionRepository.countByCreatedAtAfter(startOfToday));

        return response;
    }

    @Transactional(readOnly = true)
    public Page<CustomerAdminResponse> getCustomers(String query, AccountStatus status, Pageable pageable) {
        Page<User> users;
        if (query != null && !query.isBlank()) {
            users = userRepository.searchCustomers(Role.ROLE_CUSTOMER, query.trim(), pageable);
        } else if (status != null) {
            users = userRepository.findAllByRoleAndStatus(Role.ROLE_CUSTOMER, status, pageable);
        } else {
            users = userRepository.findAllByRole(Role.ROLE_CUSTOMER, pageable);
        }

        return users.map(this::mapToCustomerAdminResponse);
    }

    @Transactional(readOnly = true)
    public CustomerAdminResponse getCustomerDetails(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Customer not found with id: " + id));
        return mapToCustomerAdminResponse(user);
    }

    @Transactional
    public CustomerAdminResponse approveCustomer(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Customer not found with id: " + id));

        user.setStatus(AccountStatus.APPROVED);
        User savedUser = userRepository.save(user);

        // Automatically create and activate unique wallet
        walletService.createWalletForUser(savedUser);

        return mapToCustomerAdminResponse(savedUser);
    }

    @Transactional
    public CustomerAdminResponse rejectCustomer(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Customer not found with id: " + id));

        user.setStatus(AccountStatus.REJECTED);
        User savedUser = userRepository.save(user);
        return mapToCustomerAdminResponse(savedUser);
    }

    @Transactional
    public CustomerAdminResponse suspendCustomer(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Customer not found with id: " + id));

        user.setStatus(AccountStatus.SUSPENDED);
        User savedUser = userRepository.save(user);
        return mapToCustomerAdminResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public Page<TransactionAdminResponse> getTransactions(TransactionType type,
                                                          TransactionStatus status,
                                                          String reference,
                                                          Pageable pageable) {
        Page<Transaction> transactions = transactionRepository.filterTransactions(type, status, reference, pageable);
        return transactions.map(this::mapToTransactionAdminResponse);
    }

    @Transactional(readOnly = true)
    public TransactionAdminResponse getTransactionDetails(Long id) {
        Transaction txn = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found with id: " + id));
        return mapToTransactionAdminResponse(txn);
    }

    private CustomerAdminResponse mapToCustomerAdminResponse(User user) {
        CustomerAdminResponse dto = new CustomerAdminResponse();
        dto.setId(user.getId());
        dto.setCustomerId(user.getCustomerId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setAadhaarMasked(user.getAadhaarMasked());
        dto.setDateOfBirth(user.getDateOfBirth());
        dto.setGender(user.getGender());
        dto.setNationality(user.getNationality());
        dto.setResidentialAddress(user.getResidentialAddress());
        dto.setBankAccountNumberMasked(user.getBankAccountNumberMasked());
        dto.setOccupation(user.getOccupation());
        dto.setStatus(user.getStatus().name());
        dto.setRegistrationDate(user.getCreatedAt());

        walletRepository.findByUserId(user.getId()).ifPresent(w -> {
            dto.setWalletAccountNumber(w.getAccountNumber());
            dto.setWalletBalance(w.getBalance());
        });

        if (dto.getWalletBalance() == null) {
            dto.setWalletBalance(BigDecimal.ZERO.setScale(2));
        }

        return dto;
    }

    private TransactionAdminResponse mapToTransactionAdminResponse(Transaction txn) {
        TransactionAdminResponse dto = new TransactionAdminResponse();
        dto.setId(txn.getId());
        dto.setTransactionReference(txn.getTransactionReference());
        dto.setType(txn.getType().name());
        dto.setAmount(txn.getAmount());
        dto.setStatus(txn.getStatus().name());
        dto.setFailureReason(txn.getFailureReason());
        dto.setDescription(txn.getDescription());
        dto.setCreatedAt(txn.getCreatedAt());

        if (txn.getSenderWallet() != null) {
            dto.setSenderAccount(txn.getSenderWallet().getAccountNumber());
            dto.setSenderName(txn.getSenderWallet().getUser().getFullName());
        } else {
            dto.setSenderName("Cash Deposit Counter");
            dto.setSenderAccount("N/A");
        }

        if (txn.getReceiverWallet() != null) {
            dto.setReceiverAccount(txn.getReceiverWallet().getAccountNumber());
            dto.setReceiverName(txn.getReceiverWallet().getUser().getFullName());
        }

        return dto;
    }
}
