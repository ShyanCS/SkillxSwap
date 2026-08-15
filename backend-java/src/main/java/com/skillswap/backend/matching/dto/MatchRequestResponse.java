package com.skillswap.backend.matching.dto;

import com.skillswap.backend.skill.dto.UserSkillResponse;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * sender/recipient is populated depending on which list this came from
 * (getIncomingRequests sets sender, getSentRequests sets recipient) --
 * matches the frontend's RequestsPage, which reads request.sender for
 * received requests and request.recipient for sent ones.
 */
public record MatchRequestResponse(
        Long id,
        MatchRequestParticipant sender,
        MatchRequestParticipant recipient,
        List<UserSkillResponse> skillOffered,
        List<UserSkillResponse> skillWanted,
        OffsetDateTime sentAt,
        String status
) {
}
