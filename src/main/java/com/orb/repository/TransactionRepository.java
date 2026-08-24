package com.orb.repository;

import com.orb.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    @Query("SELECT t FROM Transaction t WHERE t.senderWallet.id = :walletId OR t.receiverWallet.id = :walletId ORDER BY t.createdAt DESC")
    Page<Transaction> findByWalletId(@Param("walletId") UUID walletId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.senderWallet.id = :walletId ORDER BY t.createdAt DESC")
    Page<Transaction> findBySenderWalletId(@Param("walletId") UUID walletId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.receiverWallet.id = :walletId ORDER BY t.createdAt DESC")
    Page<Transaction> findByReceiverWalletId(@Param("walletId") UUID walletId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE (t.senderWallet.id = :walletId OR t.receiverWallet.id = :walletId) AND t.createdAt BETWEEN :start AND :end ORDER BY t.createdAt DESC")
    Page<Transaction> findByWalletIdAndDateRange(@Param("walletId") UUID walletId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end, Pageable pageable);
}
