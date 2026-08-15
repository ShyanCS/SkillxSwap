package com.skillswap.backend.messaging.repository;

import com.skillswap.backend.messaging.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversationIdOrderBySentAtAsc(Long conversationId);
    Message findFirstByConversationIdOrderBySentAtDesc(Long conversationId);
    long countByConversationIdAndSenderIdNotAndReadAtIsNull(Long conversationId, Long senderId);
}
