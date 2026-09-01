package com.orb.controller;

import com.orb.dto.ApiResponse;
import com.orb.dto.WalletDTO;
import com.orb.service.WalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
@Tag(name = "Wallet", description = "Wallet balance, QR code")
public class WalletController {

    private final WalletService walletService;

    @GetMapping("/me")
    @Operation(summary = "Get own wallet", description = "Returns balance, wallet tag, and currency for the authenticated user")
    public ResponseEntity<ApiResponse<WalletDTO>> getMyWallet(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        WalletDTO wallet = walletService.getWallet(userId);
        return ResponseEntity.ok(ApiResponse.success("Wallet fetched", wallet));
    }

    @GetMapping("/qr")
    @Operation(summary = "Get wallet QR code", description = "Returns a base64-encoded PNG QR code of the wallet tag")
    public ResponseEntity<ApiResponse<Map<String, String>>> getQrCode(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        String qrBase64 = walletService.generateQrCode(userId);
        return ResponseEntity.ok(ApiResponse.success("QR code generated", Map.of("qrCode", qrBase64)));
    }
}
