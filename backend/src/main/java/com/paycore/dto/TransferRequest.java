package com.paycore.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class TransferRequest {

    @NotBlank(message = "Receiver wallet account number is required")
    private String receiverAccountNumber;

    @NotNull(message = "Transfer amount is required")
    @DecimalMin(value = "1.00", message = "Minimum transfer amount is ₹1.00")
    private BigDecimal amount;

    @NotBlank(message = "Transaction password is required")
    private String transactionPassword;

    private String description;

    public TransferRequest() {}

    public TransferRequest(String receiverAccountNumber, BigDecimal amount, String transactionPassword, String description) {
        this.receiverAccountNumber = receiverAccountNumber;
        this.amount = amount;
        this.transactionPassword = transactionPassword;
        this.description = description;
    }

    public String getReceiverAccountNumber() { return receiverAccountNumber; }
    public void setReceiverAccountNumber(String receiverAccountNumber) { this.receiverAccountNumber = receiverAccountNumber; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getTransactionPassword() { return transactionPassword; }
    public void setTransactionPassword(String transactionPassword) { this.transactionPassword = transactionPassword; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
