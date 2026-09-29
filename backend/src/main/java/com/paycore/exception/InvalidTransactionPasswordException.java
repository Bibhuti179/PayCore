package com.paycore.exception;

public class InvalidTransactionPasswordException extends RuntimeException {
    public InvalidTransactionPasswordException(String message) {
        super(message);
    }
}
