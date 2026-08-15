package com.skillswap.backend.skill.repository;

import com.skillswap.backend.skill.entity.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {
    List<UserSkill> findByUserIdAndType(Long userId, String type);
    Optional<UserSkill> findByIdAndUserId(Long id, Long userId);
    List<UserSkill> findAllByIdIn(List<Long> ids);

    // Matching engine: other users' rows of a given type for a set of skills.
    List<UserSkill> findByTypeAndSkill_IdInAndUser_IdNot(String type, List<Long> skillIds, Long excludedUserId);

    // Matching engine: current user's own row for a specific skill+type (to
    // find "my offer that satisfies their want" when building skillsRequested).
    Optional<UserSkill> findFirstByUserIdAndTypeAndSkillId(Long userId, String type, Long skillId);

    // Validates a set of ids all belong to a given user and type before persisting a MatchRequest.
    List<UserSkill> findAllByIdInAndUserIdAndType(List<Long> ids, Long userId, String type);
}
