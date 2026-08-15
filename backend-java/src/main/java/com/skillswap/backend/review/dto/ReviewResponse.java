package com.skillswap.backend.review.dto;

import com.skillswap.backend.matching.dto.UserSummary;
import com.skillswap.backend.review.entity.Review;
import com.skillswap.backend.session.dto.SchedulableSkill;

import java.time.OffsetDateTime;

public record ReviewResponse(
        Long id,
        UserSummary partner,
        SchedulableSkill skill,
        String role,
        Integer rating,
        String comment,
        OffsetDateTime createdAt
) {
    public static ReviewResponse from(Review review) {
        boolean reviewerIsTeacher = review.getSession().getTeacher().getId().equals(review.getReviewer().getId());
        return new ReviewResponse(
                review.getId(),
                UserSummary.from(review.getReviewee()),
                new SchedulableSkill(review.getSession().getSkill().getId(), review.getSession().getSkill().getName(), null),
                reviewerIsTeacher ? "teacher" : "learner",
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}
