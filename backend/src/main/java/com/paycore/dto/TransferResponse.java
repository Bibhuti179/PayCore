package com.paycore.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransferResponse {
    private String transactionReference;
    private BigDecimal amount;
    private String senderAccountNumber;
    private String senderName;
    private String receiverAccountNumber;
    private String receiverName;
    private BigDecimal updatedBalance;
    private String status;
    private LocalDateTime timestamp;

    public TransferResponse() {}

    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getSenderAccountNumber() { return senderAccountNumber; }
    public void setSenderAccountNumber(String senderAccountNumber) { this.senderAccountNumber = senderAccountNumber; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getReceiverAccountNumber() { return receiverAccountNumber; }
    public void setReceiverAccountNumber(String receiverAccountNumber) { this.receiverAccountNumber = receiverAccountNumber; }

    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }

    public BigDecimal getUpdatedBalance() { return updatedBalance; }
    public void setUpdatedBalance(BigDecimal updatedBalance) { this.updatedBalance = updatedBalance; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
