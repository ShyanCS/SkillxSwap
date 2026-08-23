package com.skillswap.backend.availability.repository;

import com.skillswap.backend.availability.entity.AvailabilitySlot;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvailabilityRepository extends JpaRepository<AvailabilitySlot, Long> {

    List<AvailabilitySlot> findByUserIdOrderByDayOfWeekAscStartMinuteAsc(Long userId);

    /** Batch load for match scoring, so N candidates don't cost N queries. */
    List<AvailabilitySlot> findByUserIdIn(Collection<Long> userIds);

    void deleteByUserId(Long userId);
}
