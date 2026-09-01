package com.orb.controller;

import com.orb.dto.ApiResponse;
import com.orb.dto.SendRequest;
import com.orb.dto.TransactionDTO;
import com.orb.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Send money and view transaction history")
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/send")
    @Operation(summary = "Send money", description = "Transfer ORB to another user by wallet tag. Requires transfer PIN.")
    public ResponseEntity<ApiResponse<TransactionDTO>> send(
            Authentication authentication,
            @Valid @RequestBody SendRequest request
    ) {
        UUID userId = UUID.fromString(authentication.getName());
        TransactionDTO transaction = transactionService.send(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Transfer successful", transaction));
    }

    @GetMapping
    @Operation(summary = "Get transaction history", description = "Paginated transaction history. Filter by: ALL, SENT, RECEIVED.")
    public ResponseEntity<ApiResponse<Page<TransactionDTO>>> getTransactions(
            Authentication authentication,
            @RequestParam(defaultValue = "ALL") String filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        UUID userId = UUID.fromString(authentication.getName());
        Page<TransactionDTO> transactions = transactionService.getTransactions(userId, filter, page, size);
        return ResponseEntity.ok(ApiResponse.success("Transactions fetched", transactions));
    }
}
