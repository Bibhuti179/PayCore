package com.paycore.repository;

import com.paycore.entity.AccountStatus;
import com.paycore.entity.Role;
import com.paycore.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByCustomerId(String customerId);

    Optional<User> findByCustomerIdOrEmail(String customerId, String email);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    long countByStatus(AccountStatus status);

    long countByRole(Role role);

    @Query("SELECT u FROM User u WHERE u.role = :role AND (" +
           "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.customerId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.phoneNumber) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<User> searchCustomers(@Param("role") Role role, @Param("query") String query, Pageable pageable);

    Page<User> findAllByRole(Role role, Pageable pageable);

    Page<User> findAllByRoleAndStatus(Role role, AccountStatus status, Pageable pageable);
}
