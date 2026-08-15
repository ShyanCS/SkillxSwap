package com.skillswap.backend.skill.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record AddSkillRequest(
        @NotNull Long skillId,
        @NotBlank @Pattern(regexp = "offer|request") String type,
        String description,
        String proficiencyLevel,
        String[] availability,
        String desiredProficiency,
        String urgency
) {
}
