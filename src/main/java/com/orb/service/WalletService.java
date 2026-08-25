package com.orb.service;

import com.orb.entity.User;
import com.orb.entity.Wallet;
import com.orb.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;

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
