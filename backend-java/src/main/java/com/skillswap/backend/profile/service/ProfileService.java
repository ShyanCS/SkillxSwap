package com.skillswap.backend.profile.service;

import com.skillswap.backend.auth.entity.User;
import com.skillswap.backend.auth.repository.UserRepository;
import com.skillswap.backend.common.exception.ApiException;
import com.skillswap.backend.profile.dto.UpdateProfileRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;

    @Transactional
    public User updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.badRequest("User not found"));

        user.setProfilePictureUrl(request.profilePictureUrl());
        user.setBio(request.bio());
        user.setRegion(request.region());
        user.setTimezone(request.timezone());

        return userRepository.save(user);
    }
}
