package com.skillswap.backend.matching.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * skillsOffered = the ids from a MatchResultResponse's skillsOffered array
 * (the matched/receiver's own offer-type UserSkill ids).
 * skillsRequested = the ids from a MatchResultResponse's skillsRequested
 * array (the current user/sender's own offer-type UserSkill ids).
 */
public record SendMatchRequestRequest(
        @NotNull Long receiverId,
        @NotEmpty List<Long> skillsOffered,
        @NotEmpty List<Long> skillsRequested
) {
}
