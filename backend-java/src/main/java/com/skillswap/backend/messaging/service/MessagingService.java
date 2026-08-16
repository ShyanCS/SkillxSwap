package com.skillswap.backend.messaging.service;

import com.skillswap.backend.auth.entity.User;
import com.skillswap.backend.auth.repository.UserRepository;
import com.skillswap.backend.common.dto.PageRequests;
import com.skillswap.backend.common.dto.PageResponse;
import com.skillswap.backend.common.exception.ApiException;
import com.skillswap.backend.matching.dto.UserSummary;
import com.skillswap.backend.matching.repository.MatchRepository;
import com.skillswap.backend.messaging.dto.ConversationSummaryResponse;
import com.skillswap.backend.messaging.dto.MessageResponse;
import com.skillswap.backend.messaging.entity.Conversation;
import com.skillswap.backend.messaging.entity.Message;
import com.skillswap.backend.messaging.repository.ConversationRepository;
import com.skillswap.backend.messaging.repository.MessageRepository;
import com.skillswap.backend.notification.service.NotificationService;
import com.skillswap.backend.realtime.RealtimeEvent;
import com.skillswap.backend.realtime.RealtimeGateway;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MessagingService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final RealtimeGateway realtimeGateway;

    /** Envelope for a pushed chat message: the client needs to know which conversation it belongs to. */
    public record IncomingMessage(Long conversationId, Long senderId, MessageResponse message) {
    }

    @Transactional(readOnly = true)
    public List<ConversationSummaryResponse> getConversations(Long userId) {
        Map<Long, Conversation> conversationByPartnerId = new LinkedHashMap<>();
        for (Conversation c : conversationRepository.findAllForUser(userId)) {
            Long partnerId = c.getUser1().getId().equals(userId) ? c.getUser2().getId() : c.getUser1().getId();
            conversationByPartnerId.put(partnerId, c);
        }

        List<ConversationSummaryResponse> result = new java.util.ArrayList<>();
        for (var match : matchRepository.findAllForUser(userId)) {
            User partner = match.getUser1().getId().equals(userId) ? match.getUser2() : match.getUser1();
            Conversation conversation = conversationByPartnerId.get(partner.getId());

            if (conversation == null) {
                result.add(new ConversationSummaryResponse(null, UserSummary.from(partner), null, 0));
                continue;
            }

            Message last = messageRepository.findFirstByConversationIdOrderBySentAtDesc(conversation.getId());
            long unread = messageRepository.countByConversationIdAndSenderIdNotAndReadAtIsNull(conversation.getId(), userId);
            result.add(new ConversationSummaryResponse(
                    conversation.getId(),
                    UserSummary.from(partner),
                    last != null ? MessageResponse.from(last) : null,
                    unread
            ));
        }

        result.sort((a, b) -> {
            OffsetDateTime aTime = a.lastMessage() != null ? a.lastMessage().sentAt() : OffsetDateTime.MIN;
            OffsetDateTime bTime = b.lastMessage() != null ? b.lastMessage().sentAt() : OffsetDateTime.MIN;
            return bTime.compareTo(aTime);
        });
        return result;
    }

    /**
     * Returns a page of messages newest-first; the caller reverses for display
     * and requests higher page numbers to scroll back through history.
     *
     * Opening a conversation marks the whole thing read, not just the page that
     * was fetched -- scoping the read receipt to one page would leave older
     * unread messages counted forever, since the user never scrolls back to
     * them once the conversation is open.
     */
    @Transactional
    public PageResponse<MessageResponse> getMessages(Long conversationId, Long userId, Integer page, Integer size) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> ApiException.notFound("Conversation not found"));
        requireParticipant(conversation, userId);

        messageRepository.markConversationRead(conversationId, userId, OffsetDateTime.now());

        Pageable pageable = PageRequests.of(page, size);
        return PageResponse.of(
                messageRepository.findByConversationIdOrderByIdDesc(conversationId, pageable),
                MessageResponse::from);
    }

    @Transactional
    public MessageResponse sendMessage(Long senderId, Long partnerId, String body) {
        boolean matched = matchRepository.findAllForUser(senderId).stream()
                .anyMatch(m -> m.getUser1().getId().equals(partnerId) || m.getUser2().getId().equals(partnerId));
        if (!matched) {
            throw ApiException.forbidden("You can only message users you've matched with");
        }

        Conversation conversation = getOrCreateConversation(senderId, partnerId);
        conversation.setUpdatedAt(OffsetDateTime.now());
        conversationRepository.save(conversation);

        Message message = Message.builder()
                .conversation(conversation)
                .sender(userRepository.getReferenceById(senderId))
                .body(body)
                .build();
        Message saved = messageRepository.save(message);

        User sender = userRepository.findById(senderId).orElseThrow();
        notificationService.notify(partnerId, "MESSAGE_RECEIVED",
                "New message from " + sender.getName(),
                body.length() > 140 ? body.substring(0, 140) + "..." : body);

        MessageResponse response = MessageResponse.from(saved);
        // Push the message itself so an open chat renders it without waiting for
        // a poll. Delivery is best-effort by design -- the message is already
        // committed, so a dropped frame costs latency, not data.
        realtimeGateway.publish(partnerId, RealtimeEvent.message(
                new IncomingMessage(conversation.getId(), senderId, response)));

        return response;
    }

    private Conversation getOrCreateConversation(Long userAId, Long userBId) {
        Long lowId = Math.min(userAId, userBId);
        Long highId = Math.max(userAId, userBId);
        return conversationRepository.findByUser1_IdAndUser2_Id(lowId, highId)
                .orElseGet(() -> conversationRepository.save(Conversation.builder()
                        .user1(userRepository.getReferenceById(lowId))
                        .user2(userRepository.getReferenceById(highId))
                        .build()));
    }

    private void requireParticipant(Conversation conversation, Long userId) {
        if (!conversation.getUser1().getId().equals(userId) && !conversation.getUser2().getId().equals(userId)) {
            throw ApiException.forbidden("Not a participant in this conversation");
        }
    }
}
