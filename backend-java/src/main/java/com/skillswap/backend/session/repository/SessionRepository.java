package com.skillswap.backend.session.repository;

import com.skillswap.backend.session.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SessionRepository extends JpaRepository<Session, Long> {

    @Query("select s from Session s where s.teacher.id = :userId or s.learner.id = :userId order by s.scheduledAt desc")
    List<Session> findAllForUser(@Param("userId") Long userId);

    long countByStatus(String status);

    @Query("""
            select count(s) from Session s
            where (s.teacher.id = :userId or s.learner.id = :userId)
              and s.status = :status
            """)
    long countForUserByStatus(@Param("userId") Long userId, @Param("status") String status);

    @Query("""
            select s from Session s
            where (s.teacher.id = :userId or s.learner.id = :userId)
              and s.status = 'Scheduled'
              and s.scheduledAt >= :from
            order by s.scheduledAt asc
            """)
    List<Session> findUpcomingForUser(@Param("userId") Long userId,
                                       @Param("from") java.time.OffsetDateTime from,
                                       org.springframework.data.domain.Pageable pageable);
}
