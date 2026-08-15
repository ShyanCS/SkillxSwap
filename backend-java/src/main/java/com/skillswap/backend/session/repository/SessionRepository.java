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
}
