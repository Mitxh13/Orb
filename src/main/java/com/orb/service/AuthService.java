package com.orb.service;

import com.orb.dto.*;
import com.orb.entity.RefreshToken;
import com.orb.entity.User;
import com.orb.exception.AccountLockedException;
import com.orb.exception.DuplicateResourceException;
import com.orb.exception.ResourceNotFoundException;
import com.orb.mapper.UserMapper;
import com.orb.repository.RefreshTokenRepository;
import com.orb.repository.UserRepository;
import com.orb.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCKOUT_MINUTES = 15;

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final WalletService walletService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email is already registered");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username is already taken");
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .username(request.getUsername().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .failedAttempts(0)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered [id={}, username={}]", savedUser.getId(), savedUser.getUsername());

        walletService.createDefaultWallet(savedUser, request.getTransferPin());

        String accessToken = jwtUtil.generateAccessToken(savedUser.getId(), savedUser.getUsername());
        String refreshTokenStr = jwtUtil.generateRefreshToken(savedUser.getId());
        
        saveRefreshToken(savedUser, refreshTokenStr);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .user(userMapper.toDTO(savedUser))
                .build();
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsernameOrEmail(request.getUsername(), request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid username or password"));

        // Check time-based lockout
        if (user.getLockoutUntil() != null && user.getLockoutUntil().isAfter(LocalDateTime.now())) {
            throw new AccountLockedException("Account is temporarily locked. Try again later.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            user.setFailedAttempts(user.getFailedAttempts() + 1);
            if (user.getFailedAttempts() >= MAX_FAILED_ATTEMPTS) {
                user.setLockoutUntil(LocalDateTime.now().plusMinutes(LOCKOUT_MINUTES));
                user.setFailedAttempts(0); // Reset for next time after lockout expires
                log.warn("Account temporarily locked for user [id={}]", user.getId());
                userRepository.save(user);
                throw new AccountLockedException("Account locked due to too many failed attempts. Try again in 15 minutes.");
            }
            userRepository.save(user);
            throw new ResourceNotFoundException("Invalid username or password");
        }

        // Reset failures on success
        if (user.getFailedAttempts() > 0 || user.getLockoutUntil() != null) {
            user.setFailedAttempts(0);
            user.setLockoutUntil(null);
            userRepository.save(user);
        }

        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getUsername());
        String refreshTokenStr = jwtUtil.generateRefreshToken(user.getId());
        
        saveRefreshToken(user, refreshTokenStr);
        log.info("User logged in [id={}, username={}]", user.getId(), user.getUsername());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .user(userMapper.toDTO(user))
                .build();
    }

    @Transactional
    public LoginResponse refresh(RefreshRequest request) {
        String tokenStr = request.getRefreshToken();
        
        RefreshToken refreshTokenEntity = refreshTokenRepository.findByToken(tokenStr)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid refresh token"));

        if (refreshTokenEntity.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshTokenEntity);
            throw new ResourceNotFoundException("Refresh token has expired");
        }

        if (!jwtUtil.validateToken(tokenStr) || !"REFRESH".equals(jwtUtil.getTokenType(tokenStr))) {
            throw new ResourceNotFoundException("Invalid token signature or type");
        }

        User user = refreshTokenEntity.getUser();
        
        if (user.getLockoutUntil() != null && user.getLockoutUntil().isAfter(LocalDateTime.now())) {
            throw new AccountLockedException("Account is locked");
        }

        // Token Rotation: Delete old, create new
        refreshTokenRepository.delete(refreshTokenEntity);
        
        String newAccessToken = jwtUtil.generateAccessToken(user.getId(), user.getUsername());
        String newRefreshTokenStr = jwtUtil.generateRefreshToken(user.getId());
        
        saveRefreshToken(user, newRefreshTokenStr);

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshTokenStr)
                .user(userMapper.toDTO(user))
                .build();
    }
    
    private void saveRefreshToken(User user, String tokenStr) {
        RefreshToken token = RefreshToken.builder()
                .user(user)
                .token(tokenStr)
                // Assuming 7 days config
                .expiryDate(Instant.now().plus(7, ChronoUnit.DAYS))
                .build();
        refreshTokenRepository.save(token);
    }
}
