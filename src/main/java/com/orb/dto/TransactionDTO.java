package com.orb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDTO {
    private UUID id;
    private String senderWalletTag;
    private String receiverWalletTag;
    private BigDecimal amount;
    private String type;
    private String status;
    private String note;
    private String referenceId;
    private LocalDateTime createdAt;
    private String direction; // SENT or RECEIVED
}
