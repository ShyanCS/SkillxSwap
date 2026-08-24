package com.skillswap.backend.matching.repository;

import com.skillswap.backend.matching.entity.MatchRequest;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatchRequestRepository extends JpaRepository<MatchRequest, Long> {
    List<MatchRequest> findByReceiverIdOrderByIdDesc(Long receiverId);

    List<MatchRequest> findBySenderIdOrderByIdDesc(Long senderId);

    Optional<MatchRequest> findFirstBySenderIdAndReceiverIdAndStatusIn(
            Long senderId, Long receiverId, List<String> statuses);
}
