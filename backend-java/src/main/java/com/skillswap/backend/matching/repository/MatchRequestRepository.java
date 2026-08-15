package com.skillswap.backend.matching.repository;

import com.skillswap.backend.matching.entity.MatchRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatchRequestRepository extends JpaRepository<MatchRequest, Long> {
    List<MatchRequest> findByReceiverIdOrderByIdDesc(Long receiverId);
    List<MatchRequest> findBySenderIdOrderByIdDesc(Long senderId);
    Optional<MatchRequest> findFirstBySenderIdAndReceiverIdAndStatusIn(Long senderId, Long receiverId, List<String> statuses);
}
