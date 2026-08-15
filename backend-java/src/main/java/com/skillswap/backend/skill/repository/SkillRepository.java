package com.skillswap.backend.skill.repository;

import com.skillswap.backend.skill.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SkillRepository extends JpaRepository<Skill, Long> {
}
