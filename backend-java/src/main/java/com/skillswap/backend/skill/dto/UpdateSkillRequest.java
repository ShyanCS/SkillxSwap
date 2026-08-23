package com.skillswap.backend.skill.dto;

public record UpdateSkillRequest(
        Long newSkillId,
        String description,
        String proficiencyLevel,
        String[] availability,
        String desiredProficiency,
        String urgency,
        String status) {}
