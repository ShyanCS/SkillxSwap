package com.skillswap.backend.review.service;

import com.skillswap.backend.auth.entity.User;
import com.skillswap.backend.auth.repository.UserRepository;
import com.skillswap.backend.common.exception.ApiException;
import com.skillswap.backend.notification.service.NotificationService;
import com.skillswap.backend.review.dto.CreateReviewRequest;
import com.skillswap.backend.review.dto.ReviewResponse;
import com.skillswap.backend.review.entity.Review;
import com.skillswap.backend.review.repository.ReviewRepository;
import com.skillswap.backend.session.dto.SessionResponse;
import com.skillswap.backend.session.entity.Session;
import com.skillswap.backend.session.repository.SessionRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<SessionResponse> getReviewableSessions(Long userId) {
        List<Session> completed = sessionRepository.findAllForUser(userId).stream()
                .filter(s -> "Completed".equals(s.getStatus()))
                .toList();

        List<Long> completedIds = completed.stream().map(Session::getId).toList();
        Set<Long> alreadyReviewed = completedIds.isEmpty()
                ? Set.of()
                : reviewRepository.findByReviewerIdAndSessionIdIn(userId, completedIds).stream()
                        .map(r -> r.getSession().getId())
                        .collect(java.util.stream.Collectors.toSet());

        return completed.stream()
                .filter(s -> !alreadyReviewed.contains(s.getId()))
                .map(s -> SessionResponse.from(s, userId))
                .toList();
    }

    @Transactional
    public ReviewResponse createReview(Long reviewerId, CreateReviewRequest request) {
        Session session = sessionRepository
                .findById(request.sessionId())
                .orElseThrow(() -> ApiException.badRequest("Session not found"));

        if (!"Completed".equals(session.getStatus())) {
            throw ApiException.badRequest("Session is not completed yet");
        }

        Long teacherId = session.getTeacher().getId();
        Long learnerId = session.getLearner().getId();
        if (!reviewerId.equals(teacherId) && !reviewerId.equals(learnerId)) {
            throw ApiException.forbidden("Not a participant in this session");
        }
        Long revieweeId = reviewerId.equals(teacherId) ? learnerId : teacherId;

        if (reviewRepository
                .findBySessionIdAndReviewerId(session.getId(), reviewerId)
                .isPresent()) {
            throw ApiException.badRequest("You have already reviewed this session");
        }

        User reviewee =
                userRepository.findById(revieweeId).orElseThrow(() -> ApiException.badRequest("Reviewee not found"));

        Review review = Review.builder()
                .session(session)
                .reviewer(userRepository.getReferenceById(reviewerId))
                .reviewee(reviewee)
                .rating(request.rating())
                .comment(request.comment())
                .build();
        Review saved = reviewRepository.save(review);

        applyRatingToReviewee(reviewee, request.rating());

        User reviewer = userRepository.findById(reviewerId).orElseThrow();
        notificationService.notify(
                revieweeId,
                "REVIEW_RECEIVED",
                reviewer.getName() + " left you a " + request.rating() + "-star review",
                request.comment() != null ? request.comment() : "No comment left.");

        return ReviewResponse.from(saved);
    }

    private void applyRatingToReviewee(User reviewee, int newRating) {
        int newCount = reviewee.getRatingCount() + 1;
        BigDecimal totalBefore = reviewee.getAverageRating().multiply(BigDecimal.valueOf(reviewee.getRatingCount()));
        BigDecimal newAverage = totalBefore
                .add(BigDecimal.valueOf(newRating))
                .divide(BigDecimal.valueOf(newCount), 2, RoundingMode.HALF_UP);
        reviewee.setAverageRating(newAverage);
        reviewee.setRatingCount(newCount);
        userRepository.save(reviewee);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getGivenReviews(Long reviewerId) {
        return reviewRepository.findByReviewerIdOrderByIdDesc(reviewerId).stream()
                .map(ReviewResponse::from)
                .toList();
    }
}
