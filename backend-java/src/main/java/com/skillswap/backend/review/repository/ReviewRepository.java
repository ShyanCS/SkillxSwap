package com.skillswap.backend.review.repository;

import com.skillswap.backend.review.entity.Review;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findBySessionIdAndReviewerId(Long sessionId, Long reviewerId);

    List<Review> findByReviewerIdOrderByIdDesc(Long reviewerId);

    List<Review> findByReviewerIdAndSessionIdIn(Long reviewerId, List<Long> sessionIds);

    List<Review> findByRevieweeIdOrderByIdDesc(Long revieweeId, org.springframework.data.domain.Pageable pageable);
}
