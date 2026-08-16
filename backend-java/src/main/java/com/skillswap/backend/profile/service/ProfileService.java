package com.skillswap.backend.profile.service;

import com.skillswap.backend.auth.entity.User;
import com.skillswap.backend.auth.repository.UserRepository;
import com.skillswap.backend.common.exception.ApiException;
import com.skillswap.backend.profile.dto.PublicProfileResponse;
import com.skillswap.backend.profile.dto.UpdateProfileRequest;
import com.skillswap.backend.review.repository.ReviewRepository;
import com.skillswap.backend.session.repository.SessionRepository;
import com.skillswap.backend.skill.dto.UserSkillResponse;
import com.skillswap.backend.skill.repository.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private static final int RECENT_FEEDBACK_LIMIT = 5;

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final SessionRepository sessionRepository;
    private final ReviewRepository reviewRepository;

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

    @Transactional(readOnly = true)
    public PublicProfileResponse getPublicProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        List<UserSkillResponse> offered = userSkillRepository.findByUserIdAndType(userId, "offer").stream()
                .map(UserSkillResponse::from)
                .toList();
        List<UserSkillResponse> requested = userSkillRepository.findByUserIdAndType(userId, "request").stream()
                .map(UserSkillResponse::from)
                .toList();

        List<PublicProfileResponse.ProfileReview> feedback = reviewRepository
                .findByRevieweeIdOrderByIdDesc(userId, PageRequest.of(0, RECENT_FEEDBACK_LIMIT))
                .stream()
                .map(review -> new PublicProfileResponse.ProfileReview(
                        review.getId(),
                        review.getReviewer().getName(),
                        review.getRating(),
                        review.getComment(),
                        review.getSession().getSkill().getName(),
                        review.getCreatedAt()))
                .toList();

        return new PublicProfileResponse(
                user.getId(),
                user.getName(),
                user.getBio(),
                user.getRegion(),
                user.getTimezone(),
                user.getProfilePictureUrl(),
                user.getAverageRating().doubleValue(),
                user.getRatingCount(),
                sessionRepository.countForUserByStatus(userId, "Completed"),
                user.getCreatedAt(),
                offered,
                requested,
                feedback
        );
    }
}
