package com.paycore.exception;

import java.math.BigDecimal;

public class InsufficientBalanceException extends RuntimeException {
    private final BigDecimal availableBalance;
    private final BigDecimal requestedAmount;

    public InsufficientBalanceException(BigDecimal availableBalance, BigDecimal requestedAmount) {
        super(String.format("Insufficient balance. Available: ₹%s, Requested: ₹%s", 
                availableBalance.setScale(2), requestedAmount.setScale(2)));
        this.availableBalance = availableBalance;
        this.requestedAmount = requestedAmount;
    }

    public BigDecimal getAvailableBalance() { return availableBalance; }
    public BigDecimal getRequestedAmount() { return requestedAmount; }
}
