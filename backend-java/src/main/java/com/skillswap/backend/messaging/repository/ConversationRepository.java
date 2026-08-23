package com.skillswap.backend.messaging.repository;

import com.skillswap.backend.messaging.entity.Conversation;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    Optional<Conversation> findByUser1_IdAndUser2_Id(Long user1Id, Long user2Id);

    @Query("select c from Conversation c where c.user1.id = :userId or c.user2.id = :userId order by c.updatedAt desc")
    List<Conversation> findAllForUser(@Param("userId") Long userId);
}
