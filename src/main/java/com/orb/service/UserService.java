package com.orb.service;

import com.orb.dto.UpdateUserRequest;
import com.orb.dto.UserDTO;
import com.orb.entity.User;
import com.orb.exception.ResourceNotFoundException;
import com.orb.mapper.UserMapper;
import com.orb.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    /**
     * Fetches the profile of the currently authenticated user.
     */
    public UserDTO getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toDTO(user);
    }

    /**
     * Updates the profile of the currently authenticated user.
     */
    @Transactional
    public UserDTO updateCurrentUser(UUID userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName().trim());
        }

        User saved = userRepository.save(user);
        log.info("User profile updated [id={}]", userId);
        return userMapper.toDTO(saved);
    }

    /**
     * Searches users by username (case-insensitive partial match).
     * Used by the send-money recipient search on the frontend.
     */
    public List<UserDTO> searchByUsername(String username) {
        return userRepository.findByUsernameContainingIgnoreCase(username)
                .stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }
}
