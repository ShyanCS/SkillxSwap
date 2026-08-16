package com.skillswap.backend.profile.controller;

import com.skillswap.backend.auth.dto.UserResponse;
import com.skillswap.backend.auth.entity.User;
import com.skillswap.backend.auth.security.CustomUserDetails;
import com.skillswap.backend.profile.dto.CloudinarySignatureResponse;
import com.skillswap.backend.profile.dto.UpdateProfileRequest;
import com.skillswap.backend.profile.service.CloudinarySignatureService;
import com.skillswap.backend.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final CloudinarySignatureService cloudinarySignatureService;

    @PutMapping
    public Map<String, Object> updateProfile(@AuthenticationPrincipal CustomUserDetails principal,
                                              @RequestBody UpdateProfileRequest request) {
        User updated = profileService.updateProfile(principal.getId(), request);
        return Map.of(
                "message", "Profile updated successfully",
                "user", UserResponse.from(updated)
        );
    }

    @GetMapping("/cloudinary-sign")
    public CloudinarySignatureResponse cloudinarySign() {
        return cloudinarySignatureService.generateSignature();
    }

    /** Another member's profile. Authenticated-only; never exposes email. */
    @GetMapping("/{userId}")
    public com.skillswap.backend.profile.dto.PublicProfileResponse publicProfile(@PathVariable Long userId) {
        return profileService.getPublicProfile(userId);
    }
}
