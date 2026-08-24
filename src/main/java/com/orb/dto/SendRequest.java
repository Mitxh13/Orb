package com.orb.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendRequest {
    @NotBlank(message = "Receiver wallet tag is required")
    private String receiverWalletTag;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @Digits(integer = 13, fraction = 2, message = "Invalid amount format")
    private BigDecimal amount;

    @NotBlank(message = "Transfer PIN is required")
    @Pattern(regexp = "^\\d{4}$", message = "Transfer PIN must be exactly 4 digits")
    private String pin;

    @Size(max = 500, message = "Note must be under 500 characters")
    private String note;
}
