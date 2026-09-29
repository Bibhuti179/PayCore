package com.paycore.dto;

public class ReceiverLookupResponse {
    private String accountNumber;
    private String receiverName;
    private boolean valid;

    public ReceiverLookupResponse() {}

    public ReceiverLookupResponse(String accountNumber, String receiverName, boolean valid) {
        this.accountNumber = accountNumber;
        this.receiverName = receiverName;
        this.valid = valid;
    }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }
}
