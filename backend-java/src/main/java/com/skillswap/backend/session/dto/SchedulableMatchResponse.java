package com.skillswap.backend.session.dto;

import com.skillswap.backend.matching.dto.UserSummary;

import java.util.List;

public record SchedulableMatchResponse(
        Long matchId,
        UserSummary partner,
        List<SchedulableSkill> teachableByPartner,
        List<SchedulableSkill> teachableByMe
) {
}
