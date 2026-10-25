package com.udaan.profile.controller;

import com.udaan.common.ApiResponse;
import com.udaan.profile.dto.ProfileDtos.*;
import com.udaan.profile.entity.User;
import com.udaan.profile.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<User>> getProfile(
            @RequestParam(value = "userId", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(profileService.getUserProfile(userId)));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @RequestParam(value = "userId", defaultValue = "1") Long userId,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Profile updated", profileService.updateProfile(userId, request)));
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getDashboardSummary(
            @RequestParam(value = "userId", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(profileService.getDashboardSummary(userId)));
    }
}
