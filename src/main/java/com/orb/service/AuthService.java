package com.orb.service;

import com.orb.dto.*;
import com.orb.entity.User;
import com.orb.exception.AccountLockedException;
import com.orb.exception.DuplicateResourceException;
import com.orb.exception.ResourceNotFoundException;
import com.orb.mapper.UserMapper;
import com.orb.repository.UserRepository;
import com.orb.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;

    private final UserRepository userRepository;
    private final WalletService walletService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;

    /**
     * Registers a new user AND creates their wallet in a single transaction.
     * Rule #1: User + wallet creation is one transaction.
     * If wallet creation fails, user creation rolls back completely.
     */
    @Transactional
    public LoginResponse register(RegisterRequest request) {
        // Check for duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email is already registered");
        }

        // Check for duplicate username
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username is already taken");
        }

        // Create and save user
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

        // Create wallet in SAME transaction (Rule #1)
        walletService.createDefaultWallet(savedUser, request.getTransferPin());

        // Generate tokens
        String accessToken = jwtUtil.generateAccessToken(savedUser.getId(), savedUser.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(savedUser.getId());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userMapper.toDTO(savedUser))
                .build();
    }

    /**
     * Authenticates a user by username/email and password.
     * Tracks failed attempts and locks account after 5 failures.
     */
    @Transactional
    public LoginResponse login(LoginRequest request) {
        // Find user by username or email
        User user = userRepository.findByUsernameOrEmail(request.getUsername(), request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid username or password"));

        // Check if account is locked
        if (!user.getIsActive()) {
            throw new AccountLockedException("Account is locked due to too many failed login attempts. Please contact support.");
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            // Increment failed attempts
            user.setFailedAttempts(user.getFailedAttempts() + 1);
            log.warn("Failed login attempt for user [id={}], attempts: {}", user.getId(), user.getFailedAttempts());

            // Lock account after MAX_FAILED_ATTEMPTS
            if (user.getFailedAttempts() >= MAX_FAILED_ATTEMPTS) {
                user.setIsActive(false);
                userRepository.save(user);
                log.warn("Account locked for user [id={}] after {} failed attempts", user.getId(), MAX_FAILED_ATTEMPTS);
                throw new AccountLockedException("Account has been locked due to too many failed login attempts.");
            }

            userRepository.save(user);
            throw new ResourceNotFoundException("Invalid username or password");
        }

        // Successful login — reset failed attempts
        if (user.getFailedAttempts() > 0) {
            user.setFailedAttempts(0);
            userRepository.save(user);
        }

        // Generate tokens
        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());

        log.info("User logged in [id={}, username={}]", user.getId(), user.getUsername());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userMapper.toDTO(user))
                .build();
    }

    /**
     * Refreshes an access token using a valid refresh token.
     */
    public LoginResponse refresh(RefreshRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtUtil.validateToken(refreshToken)) {
            throw new ResourceNotFoundException("Invalid or expired refresh token");
        }

        // Ensure it's actually a REFRESH token
        String tokenType = jwtUtil.getTokenType(refreshToken);
        if (!"REFRESH".equals(tokenType)) {
            throw new ResourceNotFoundException("Invalid token type — expected a refresh token");
        }

        UUID userId = jwtUtil.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getIsActive()) {
            throw new AccountLockedException("Account is locked");
        }

        // Issue new access token (keep same refresh token)
        String newAccessToken = jwtUtil.generateAccessToken(user.getId(), user.getUsername());

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .user(userMapper.toDTO(user))
                .build();
    }
}
