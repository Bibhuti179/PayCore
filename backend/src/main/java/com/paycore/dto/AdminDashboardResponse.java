package com.paycore.dto;

import java.math.BigDecimal;

public class AdminDashboardResponse {
    private long totalCustomers;
    private long approvedCustomers;
    private long pendingCustomers;
    private long rejectedCustomers;
    private long suspendedCustomers;
    private long totalWallets;
    private BigDecimal totalSystemBalance;
    private long totalTransactions;
    private long todayTransactions;

    public AdminDashboardResponse() {}

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

    public BigDecimal getTotalSystemBalance() { return totalSystemBalance; }
    public void setTotalSystemBalance(BigDecimal totalSystemBalance) { this.totalSystemBalance = totalSystemBalance; }

    public long getTotalTransactions() { return totalTransactions; }
    public void setTotalTransactions(long totalTransactions) { this.totalTransactions = totalTransactions; }

    public long getTodayTransactions() { return todayTransactions; }
    public void setTodayTransactions(long todayTransactions) { this.todayTransactions = todayTransactions; }
}
