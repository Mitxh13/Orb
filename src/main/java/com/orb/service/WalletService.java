package com.orb.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.orb.dto.WalletDTO;
import com.orb.entity.User;
import com.orb.entity.Wallet;
import com.orb.exception.ResourceNotFoundException;
import com.orb.mapper.WalletMapper;
import com.orb.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.Base64;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletMapper walletMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * Fetches the wallet for the authenticated user.
     */
    public WalletDTO getWallet(UUID userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));
        return walletMapper.toDTO(wallet);
    }

    /**
     * Generates a QR code PNG containing the wallet tag, returned as a base64 string.
     */
    public String generateQrCode(UUID userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        String qrContent = wallet.getWalletTag();

        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(qrContent, BarcodeFormat.QR_CODE, 300, 300);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);

            return Base64.getEncoder().encodeToString(outputStream.toByteArray());
        } catch (WriterException | IOException e) {
            log.error("Failed to generate QR code for wallet [tag={}]: {}", wallet.getWalletTag(), e.getMessage());
            throw new RuntimeException("Failed to generate QR code");
        }
    }

    /**
     * Creates a default wallet for a newly registered user.
     * MUST be called inside the same @Transactional as user creation (Rule #1).
     *
     * @param user the persisted User entity
     * @param rawPin the raw 4-digit transfer PIN to hash
     * @return the created Wallet
     */
    public Wallet createDefaultWallet(User user, String rawPin) {
        String walletTag = generateUniqueWalletTag(user.getUsername());
        String pinHash = passwordEncoder.encode(rawPin);

        Wallet wallet = Wallet.builder()
                .user(user)
                .balance(new BigDecimal("100000.00"))
                .currency("ORB")
                .walletTag(walletTag)
                .transferPinHash(pinHash)
                .isLocked(false)
                .build();

        Wallet saved = walletRepository.save(wallet);
        log.info("Created wallet [tag={}] for user [id={}]", walletTag, user.getId());
        return saved;
    }

    /**
     * Generates a unique wallet tag like @username_a7f2.
     * Appends random hex suffix and retries on collision.
     */
    private String generateUniqueWalletTag(String username) {
        String tag;
        int attempts = 0;
        do {
            String suffix = UUID.randomUUID().toString().substring(0, 4);
            tag = "@" + username.toLowerCase() + "_" + suffix;
            attempts++;
            if (attempts > 10) {
                // Extremely unlikely — use full UUID segment
                tag = "@" + username.toLowerCase() + "_" + UUID.randomUUID().toString().substring(0, 8);
            }
        } while (walletRepository.existsByWalletTag(tag));
        return tag;
    }
}
