package com.skillswap.backend.session.repository;

import com.skillswap.backend.session.entity.Session;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SessionRepository extends JpaRepository<Session, Long> {

    @Query("select s from Session s where s.teacher.id = :userId or s.learner.id = :userId order by s.scheduledAt desc")
    List<Session> findAllForUser(@Param("userId") Long userId);

    long countByStatus(String status);

    @Query(
            """
            select count(s) from Session s
            where (s.teacher.id = :userId or s.learner.id = :userId)
              and s.status = :status
            """)
    long countForUserByStatus(@Param("userId") Long userId, @Param("status") String status);

    @Query(
            """
            select s from Session s
            where (s.teacher.id = :userId or s.learner.id = :userId)
              and s.status = 'Scheduled'
              and s.scheduledAt >= :from
            order by s.scheduledAt asc
            """)
    List<Session> findUpcomingForUser(
            @Param("userId") Long userId,
            @Param("from") java.time.OffsetDateTime from,
            org.springframework.data.domain.Pageable pageable);

    /**
     * Scheduled sessions for either participant starting in a window.
     *
     * Overlap is decided in Java rather than SQL because a session's end is
     * start + duration_minutes, and expressing that as a portable interval
     * predicate in JPQL is not possible. The window is widened by the caller so
     * a session starting before the proposed slot but running into it is still
     * returned.
     */
    @Query(
            """
            select s from Session s
            where (s.teacher.id in :userIds or s.learner.id in :userIds)
              and s.status = 'Scheduled'
              and s.scheduledAt between :from and :to
            """)
    List<Session> findScheduledForUsersBetween(
            @Param("userIds") java.util.Collection<Long> userIds,
            @Param("from") java.time.OffsetDateTime from,
            @Param("to") java.time.OffsetDateTime to);
}
