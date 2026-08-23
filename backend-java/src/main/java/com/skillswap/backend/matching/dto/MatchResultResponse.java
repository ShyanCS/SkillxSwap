package com.skillswap.backend.matching.dto;

import java.util.List;

public record MatchResultResponse(
        Long id,
        UserSummary user,
        List<MatchSkillItem> skillsOffered,
        List<MatchSkillItem> skillsRequested,
        int compatibilityScore,
        List<String> mutualInterests,
        String lastActive) {}
