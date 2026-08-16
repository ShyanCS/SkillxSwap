package com.skillswap.backend.messaging.repository;

import com.skillswap.backend.messaging.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;

public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Newest first: a chat opens at the bottom, so page 0 must be the most
     * recent messages, with older pages fetched as the user scrolls up. The
     * client reverses each page for display.
     *
     * Ordered by id rather than sentAt because two messages can share a
     * timestamp at the database's clock resolution, and an unstable sort would
     * duplicate or drop rows across page boundaries.
     */
    Page<Message> findByConversationIdOrderByIdDesc(Long conversationId, Pageable pageable);

    Message findFirstByConversationIdOrderBySentAtDesc(Long conversationId);

    long countByConversationIdAndSenderIdNotAndReadAtIsNull(Long conversationId, Long senderId);

    /**
     * One statement instead of a save() per unread message, which is what the
     * unpaginated version did -- and which paginating would otherwise have
     * broken outright, since only the fetched page would ever be marked read.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update Message m
               set m.readAt = :now
             where m.conversation.id = :conversationId
               and m.sender.id <> :userId
               and m.readAt is null
            """)
    int markConversationRead(@Param("conversationId") Long conversationId,
                             @Param("userId") Long userId,
                             @Param("now") OffsetDateTime now);
}
