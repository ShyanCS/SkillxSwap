package com.skillswap.backend.matching.repository;

import com.skillswap.backend.matching.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MatchRepository extends JpaRepository<Match, Long> {

    @Query("select m from Match m where m.user1.id = :userId or m.user2.id = :userId order by m.id desc")
    List<Match> findAllForUser(@Param("userId") Long userId);
}
