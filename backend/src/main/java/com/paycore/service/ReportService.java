package com.paycore.service;

import com.paycore.dto.AdminReportResponse;
import com.paycore.entity.AccountStatus;
import com.paycore.entity.Role;
import com.paycore.entity.TransactionStatus;
import com.paycore.entity.TransactionType;
import com.paycore.repository.TransactionRepository;
import com.paycore.repository.UserRepository;
import com.paycore.repository.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    public ReportService(UserRepository userRepository,
                         WalletRepository walletRepository,
                         TransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public AdminReportResponse generateSystemReports() {
        AdminReportResponse report = new AdminReportResponse();

        // Transaction Metrics
        report.setTotalTransactions(transactionRepository.count());
        report.setSuccessfulTransactions(transactionRepository.countByStatus(TransactionStatus.SUCCESS));
        report.setFailedTransactions(transactionRepository.countByStatus(TransactionStatus.FAILED));
        report.setTotalTransferAmount(transactionRepository.sumAmountByType(TransactionType.TRANSFER));
        report.setTotalDepositAmount(transactionRepository.sumAmountByType(TransactionType.DEPOSIT));

        // Customer Metrics
        report.setTotalCustomers(userRepository.countByRole(Role.ROLE_CUSTOMER));
        report.setApprovedCustomers(userRepository.countByStatus(AccountStatus.APPROVED));
        report.setPendingCustomers(userRepository.countByStatus(AccountStatus.VERIFICATION_PENDING));
        report.setRejectedCustomers(userRepository.countByStatus(AccountStatus.REJECTED));
        report.setSuspendedCustomers(userRepository.countByStatus(AccountStatus.SUSPENDED));

        // Wallet Metrics
        report.setTotalWallets(walletRepository.count());
        report.setActiveWallets(walletRepository.countByStatus("ACTIVE"));
        report.setTotalSystemBalance(walletRepository.sumTotalSystemBalance());

        return report;
    }
}
