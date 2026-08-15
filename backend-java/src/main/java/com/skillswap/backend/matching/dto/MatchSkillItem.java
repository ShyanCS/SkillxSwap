package com.skillswap.backend.matching.dto;

/**
 * userSkillId's owner differs by array: in a MatchResultResponse's
 * skillsOffered, it's the MATCHED user's own offer-type UserSkill id (what
 * they teach). In skillsRequested, it's the CURRENT user's own offer-type
 * UserSkill id that fulfils the matched user's want -- deliberately, so the
 * frontend can hand both arrays' ids straight back to POST /api/match-requests
 * without knowing which side owns which id.
 */
public record MatchSkillItem(
        Long userSkillId,
        Long skillId,
        String name,
        String proficiencyLevel,
        String desiredProficiency,
        String description
) {
}
