package com.skillswap.backend.review.controller;

import com.skillswap.backend.auth.security.CustomUserDetails;
import com.skillswap.backend.review.dto.CreateReviewRequest;
import com.skillswap.backend.review.dto.ReviewResponse;
import com.skillswap.backend.review.service.ReviewService;
import com.skillswap.backend.session.dto.SessionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/reviewable-sessions")
    public List<SessionResponse> reviewableSessions(@AuthenticationPrincipal CustomUserDetails principal) {
        return reviewService.getReviewableSessions(principal.getId());
    }

    @PostMapping
    public ReviewResponse create(@AuthenticationPrincipal CustomUserDetails principal,
                                  @Valid @RequestBody CreateReviewRequest request) {
        return reviewService.createReview(principal.getId(), request);
    }

    @GetMapping
    public List<ReviewResponse> given(@AuthenticationPrincipal CustomUserDetails principal) {
        return reviewService.getGivenReviews(principal.getId());
    }
}
