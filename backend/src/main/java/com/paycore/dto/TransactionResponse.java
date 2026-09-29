package com.paycore.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransactionResponse {
    private Long id;
    private String transactionReference;
    private String type; // DEPOSIT, TRANSFER
    private String direction; // SENT, RECEIVED, SELF_DEPOSIT
    private String fromAccount;
    private String fromCustomerName;
    private String toAccount;
    private String toCustomerName;
    private BigDecimal amount;
    private String status; // SUCCESS, FAILED
    private String failureReason;
    private String description;
    private LocalDateTime createdAt;

    public TransactionResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDirection() { return direction; }
    public void setDirection(String direction) { this.direction = direction; }

    public String getFromAccount() { return fromAccount; }
    public void setFromAccount(String fromAccount) { this.fromAccount = fromAccount; }

    public String getFromCustomerName() { return fromCustomerName; }
    public void setFromCustomerName(String fromCustomerName) { this.fromCustomerName = fromCustomerName; }

    public String getToAccount() { return toAccount; }
    public void setToAccount(String toAccount) { this.toAccount = toAccount; }

    public String getToCustomerName() { return toCustomerName; }
    public void setToCustomerName(String toCustomerName) { this.toCustomerName = toCustomerName; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
