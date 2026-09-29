package com.paycore.dto;

import java.math.BigDecimal;

public class AdminReportResponse {

    // Transaction Report
    private long totalTransactions;
    private long successfulTransactions;
    private long failedTransactions;
    private BigDecimal totalTransferAmount;
    private BigDecimal totalDepositAmount;

    // Customer Report
    private long totalCustomers;
    private long approvedCustomers;
    private long pendingCustomers;
    private long rejectedCustomers;
    private long suspendedCustomers;

    // Wallet Report
    private long totalWallets;
    private long activeWallets;
    private BigDecimal totalSystemBalance;

    public AdminReportResponse() {}

    public long getTotalTransactions() { return totalTransactions; }
    public void setTotalTransactions(long totalTransactions) { this.totalTransactions = totalTransactions; }

    public long getSuccessfulTransactions() { return successfulTransactions; }
    public void setSuccessfulTransactions(long successfulTransactions) { this.successfulTransactions = successfulTransactions; }

    public long getFailedTransactions() { return failedTransactions; }
    public void setFailedTransactions(long failedTransactions) { this.failedTransactions = failedTransactions; }

    public BigDecimal getTotalTransferAmount() { return totalTransferAmount; }
    public void setTotalTransferAmount(BigDecimal totalTransferAmount) { this.totalTransferAmount = totalTransferAmount; }

    public BigDecimal getTotalDepositAmount() { return totalDepositAmount; }
    public void setTotalDepositAmount(BigDecimal totalDepositAmount) { this.totalDepositAmount = totalDepositAmount; }

    public long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }

    public long getApprovedCustomers() { return approvedCustomers; }
    public void setApprovedCustomers(long approvedCustomers) { this.approvedCustomers = approvedCustomers; }

    public long getPendingCustomers() { return pendingCustomers; }
    public void setPendingCustomers(long pendingCustomers) { this.pendingCustomers = pendingCustomers; }

    public long getRejectedCustomers() { return rejectedCustomers; }
    public void setRejectedCustomers(long rejectedCustomers) { this.rejectedCustomers = rejectedCustomers; }

    public long getSuspendedCustomers() { return suspendedCustomers; }
    public void setSuspendedCustomers(long suspendedCustomers) { this.suspendedCustomers = suspendedCustomers; }

    public long getTotalWallets() { return totalWallets; }
    public void setTotalWallets(long totalWallets) { this.totalWallets = totalWallets; }

    public long getActiveWallets() { return activeWallets; }
    public void setActiveWallets(long activeWallets) { this.activeWallets = activeWallets; }

    public BigDecimal getTotalSystemBalance() { return totalSystemBalance; }
    public void setTotalSystemBalance(BigDecimal totalSystemBalance) { this.totalSystemBalance = totalSystemBalance; }
}
