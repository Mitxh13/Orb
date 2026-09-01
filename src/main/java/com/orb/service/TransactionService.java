package com.orb.service;

import com.orb.dto.SendRequest;
import com.orb.dto.TransactionDTO;
import com.orb.entity.Transaction;
import com.orb.entity.Wallet;
import com.orb.exception.InsufficientBalanceException;
import com.orb.exception.InvalidPinException;
import com.orb.exception.InvalidTransferException;
import com.orb.exception.ResourceNotFoundException;
import com.orb.mapper.TransactionMapper;
import com.orb.repository.TransactionRepository;
import com.orb.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    /**
     * Executes a P2P transfer with full pessimistic locking and deadlock prevention.
     * Fix 1: Concurrency Race Condition resolved.
     */
    @Transactional
    public TransactionDTO send(UUID senderUserId, SendRequest request) {
        // Step 1: Read without lock to get IDs for ordered locking (deadlock prevention)
        Wallet senderWalletUnlocked = walletRepository.findByUserId(senderUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender wallet not found"));

        String receiverTag = request.getReceiverWalletTag().startsWith("@")
                ? request.getReceiverWalletTag()
                : "@" + request.getReceiverWalletTag();

        Wallet receiverWalletUnlocked = walletRepository.findByWalletTag(receiverTag)
                .orElseThrow(() -> new ResourceNotFoundException("Receiver wallet not found: " + receiverTag));

        if (senderWalletUnlocked.getId().equals(receiverWalletUnlocked.getId())) {
            throw new InvalidTransferException("Cannot transfer to yourself");
        }

        // Step 2: Lock wallets in consistent order to prevent deadlocks
        Wallet senderWallet;
        Wallet receiverWallet;

        if (senderWalletUnlocked.getId().compareTo(receiverWalletUnlocked.getId()) < 0) {
            senderWallet = walletRepository.findByIdForUpdate(senderWalletUnlocked.getId()).get();
            receiverWallet = walletRepository.findByIdForUpdate(receiverWalletUnlocked.getId()).get();
        } else {
            receiverWallet = walletRepository.findByIdForUpdate(receiverWalletUnlocked.getId()).get();
            senderWallet = walletRepository.findByIdForUpdate(senderWalletUnlocked.getId()).get();
        }

        // Step 3: Verify PIN
        if (!passwordEncoder.matches(request.getPin(), senderWallet.getTransferPinHash())) {
            throw new InvalidPinException("Invalid transfer PIN");
        }

        // Step 4: Check balance strictly inside the lock
        BigDecimal amount = request.getAmount();
        if (senderWallet.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient balance. Available: " + senderWallet.getBalance());
        }

        // Step 5: Execute transfer safely
        senderWallet.setBalance(senderWallet.getBalance().subtract(amount));
        receiverWallet.setBalance(receiverWallet.getBalance().add(amount));

        walletRepository.save(senderWallet);
        walletRepository.save(receiverWallet);

        Transaction transaction = Transaction.builder()
                .senderWallet(senderWallet)
                .receiverWallet(receiverWallet)
                .amount(amount)
                .type("TRANSFER")
                .status("SUCCESS")
                .note(request.getNote())
                .referenceId(UUID.randomUUID().toString())
                .build();

        Transaction saved = transactionRepository.save(transaction);
        
        log.info("Transfer complete [ref={}, from={}, to={}, amount={}]",
                saved.getReferenceId(), senderWallet.getWalletTag(),
                receiverWallet.getWalletTag(), amount);

        // Step 6: Async notification
        notificationService.notifyTransfer(receiverWallet.getUser(), senderWallet.getWalletTag(), amount);

        TransactionDTO dto = transactionMapper.toDTO(saved);
        dto.setDirection("SENT");
        return dto;
    }

    /**
     * Fetches paginated transaction history for a user's wallet.
     * Supports filtering by direction: ALL, SENT, RECEIVED.
     */
    public Page<TransactionDTO> getTransactions(UUID userId, String filter, int page, int size) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Transaction> transactions;

        switch (filter.toUpperCase()) {
            case "SENT":
                transactions = transactionRepository.findBySenderWalletId(wallet.getId(), pageable);
                break;
            case "RECEIVED":
                transactions = transactionRepository.findByReceiverWalletId(wallet.getId(), pageable);
                break;
            default:
                transactions = transactionRepository.findByWalletId(wallet.getId(), pageable);
                break;
        }

        return transactions.map(t -> {
            TransactionDTO dto = transactionMapper.toDTO(t);
            dto.setDirection(t.getSenderWallet().getId().equals(wallet.getId()) ? "SENT" : "RECEIVED");
            return dto;
        });
    }

    /**
     * Fetches transactions within a date range.
     */
    public Page<TransactionDTO> getTransactionsByDateRange(UUID userId, LocalDateTime start, LocalDateTime end, int page, int size) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Transaction> transactions = transactionRepository.findByWalletIdAndDateRange(wallet.getId(), start, end, pageable);

        return transactions.map(t -> {
            TransactionDTO dto = transactionMapper.toDTO(t);
            dto.setDirection(t.getSenderWallet().getId().equals(wallet.getId()) ? "SENT" : "RECEIVED");
            return dto;
        });
    }
}
