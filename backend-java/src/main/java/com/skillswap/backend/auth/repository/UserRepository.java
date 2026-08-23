package com.skillswap.backend.auth.repository;

import com.skillswap.backend.auth.entity.User;
import java.util.Collection;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /**
     * Incremented in the database rather than by loading and saving the entity:
     * both participants of a session are bumped in the same transaction, and a
     * read-modify-write would lose an increment if two of a user's sessions were
     * completed concurrently.
     */
    @Modifying
    @Query("update User u set u.sessionsCompleted = u.sessionsCompleted + 1 where u.id in :ids")
    void incrementSessionsCompleted(@Param("ids") Collection<Long> ids);

    /** Admin user search. Paging alone would make finding one account hopeless. */
    Page<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email, Pageable pageable);
}
