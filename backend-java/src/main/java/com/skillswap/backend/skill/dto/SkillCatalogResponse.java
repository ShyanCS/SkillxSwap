package com.skillswap.backend.skill.dto;

import com.skillswap.backend.skill.entity.Skill;

public record SkillCatalogResponse(Long id, String name) {
    public static SkillCatalogResponse from(Skill skill) {
        return new SkillCatalogResponse(skill.getId(), skill.getName());
    }
}
