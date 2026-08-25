package com.orb.controller;

import com.orb.dto.ApiResponse;
import com.orb.dto.UpdateUserRequest;
import com.orb.dto.UserDTO;
import com.orb.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile and search")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get own profile", description = "Returns the currently authenticated user's profile")
    public ResponseEntity<ApiResponse<UserDTO>> getMe(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        UserDTO user = userService.getCurrentUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Profile fetched", user));
    }

    @PutMapping("/me")
    @Operation(summary = "Update own profile", description = "Update the currently authenticated user's full name")
    public ResponseEntity<ApiResponse<UserDTO>> updateMe(
            Authentication authentication,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        UUID userId = UUID.fromString(authentication.getName());
        UserDTO user = userService.updateCurrentUser(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", user));
    }

    @GetMapping("/search")
    @Operation(summary = "Search users by username", description = "Find users by partial username match (for send-money recipient search)")
    public ResponseEntity<ApiResponse<List<UserDTO>>> searchUsers(
            @RequestParam String username
    ) {
        List<UserDTO> users = userService.searchByUsername(username);
        return ResponseEntity.ok(ApiResponse.success("Users found", users));
    }
}
