package com.paycore.repository;

import com.paycore.entity.Transaction;
import com.paycore.entity.TransactionStatus;
import com.paycore.entity.TransactionType;
import com.paycore.entity.Wallet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByTransactionReference(String transactionReference);

    @Query("SELECT t FROM Transaction t WHERE t.senderWallet = :wallet OR t.receiverWallet = :wallet ORDER BY t.createdAt DESC")
    Page<Transaction> findByWalletInvolved(@Param("wallet") Wallet wallet, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE (t.senderWallet = :wallet OR t.receiverWallet = :wallet) AND t.type = :type ORDER BY t.createdAt DESC")
    Page<Transaction> findByWalletInvolvedAndType(@Param("wallet") Wallet wallet, @Param("type") TransactionType type, Pageable pageable);

    Page<Transaction> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE " +
           "(:type IS NULL OR t.type = :type) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:reference IS NULL OR LOWER(t.transactionReference) LIKE LOWER(CONCAT('%', :reference, '%')))")
    Page<Transaction> filterTransactions(
            @Param("type") TransactionType type,
            @Param("status") TransactionStatus status,
            @Param("reference") String reference,
            Pageable pageable
    );

    long countByStatus(TransactionStatus status);

    long countByCreatedAtAfter(LocalDateTime dateTime);

    @Query("SELECT COALESCE(SUM(t.amount), 0.00) FROM Transaction t WHERE t.type = :type AND t.status = 'SUCCESS'")
    BigDecimal sumAmountByType(@Param("type") TransactionType type);
}
