package com.skillswap.backend.skill.dto;

import com.skillswap.backend.skill.entity.UserSkill;

import java.time.OffsetDateTime;

public record UserSkillResponse(
        Long id,
        String type,
        String description,
        String status,
        OffsetDateTime createdAt,
        Long skillId,
        String name,
        String proficiencyLevel,
        String desiredProficiency,
        String urgency,
        String[] availability
) {
    public static UserSkillResponse from(UserSkill userSkill) {
        return new UserSkillResponse(
                userSkill.getId(),
                userSkill.getType(),
                userSkill.getDescription(),
                userSkill.getStatus(),
                userSkill.getCreatedAt(),
                userSkill.getSkill().getId(),
                userSkill.getSkill().getName(),
                userSkill.getProficiencyLevel(),
                userSkill.getDesiredProficiency(),
                userSkill.getUrgency(),
                userSkill.getAvailability()
        );
    }
}
