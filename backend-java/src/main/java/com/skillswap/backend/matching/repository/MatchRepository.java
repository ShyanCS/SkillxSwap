package com.skillswap.backend.matching.repository;

import com.skillswap.backend.matching.entity.Match;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MatchRepository extends JpaRepository<Match, Long> {

    @Query("select m from Match m where m.user1.id = :userId or m.user2.id = :userId order by m.id desc")
    List<Match> findAllForUser(@Param("userId") Long userId);

    @Query("select count(m) from Match m where m.user1.id = :userId or m.user2.id = :userId")
    long countForUser(@Param("userId") Long userId);
}
