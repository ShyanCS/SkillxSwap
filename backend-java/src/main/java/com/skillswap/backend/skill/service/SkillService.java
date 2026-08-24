package com.skillswap.backend.skill.service;

import com.skillswap.backend.auth.repository.UserRepository;
import com.skillswap.backend.common.exception.ApiException;
import com.skillswap.backend.skill.dto.AddSkillRequest;
import com.skillswap.backend.skill.dto.SkillCatalogResponse;
import com.skillswap.backend.skill.dto.UpdateSkillRequest;
import com.skillswap.backend.skill.dto.UserSkillResponse;
import com.skillswap.backend.skill.entity.Skill;
import com.skillswap.backend.skill.entity.UserSkill;
import com.skillswap.backend.skill.repository.SkillRepository;
import com.skillswap.backend.skill.repository.UserSkillRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * DTO mapping happens inside these @Transactional methods, not in the
 * controller -- UserSkill.skill is a LAZY association, so accessing it after
 * the transaction/session closes throws LazyInitializationException.
 */
@Service
@RequiredArgsConstructor
public class SkillService {

    private final UserSkillRepository userSkillRepository;
    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    @Transactional
    public UserSkillResponse addSkill(Long userId, AddSkillRequest request) {
        Skill skill =
                skillRepository.findById(request.skillId()).orElseThrow(() -> ApiException.badRequest("Unknown skill"));

        UserSkill.UserSkillBuilder builder = UserSkill.builder()
                .user(userRepository.getReferenceById(userId))
                .skill(skill)
                .type(request.type())
                .description(request.description())
                .status("Active");

        if ("offer".equals(request.type())) {
            builder.proficiencyLevel(request.proficiencyLevel()).availability(request.availability());
        } else {
            builder.urgency(request.urgency()).desiredProficiency(request.desiredProficiency());
        }

        return UserSkillResponse.from(userSkillRepository.save(builder.build()));
    }

    @Transactional(readOnly = true)
    public List<UserSkillResponse> getSkills(Long userId, String type) {
        return userSkillRepository.findByUserIdAndType(userId, type).stream()
                .map(UserSkillResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SkillCatalogResponse> listCatalog() {
        return skillRepository.findAll().stream()
                .map(SkillCatalogResponse::from)
                .toList();
    }

    @Transactional
    public UserSkillResponse updateSkill(Long userSkillId, Long userId, UpdateSkillRequest request) {
        UserSkill userSkill = userSkillRepository
                .findByIdAndUserId(userSkillId, userId)
                .orElseThrow(() -> ApiException.badRequest("Skill not found"));

        if (request.newSkillId() != null) {
            Skill skill = skillRepository
                    .findById(request.newSkillId())
                    .orElseThrow(() -> ApiException.badRequest("Unknown skill"));
            userSkill.setSkill(skill);
        }
        if (request.description() != null) {
            userSkill.setDescription(request.description());
        }

        if ("request".equals(userSkill.getType())) {
            if (request.urgency() != null) userSkill.setUrgency(request.urgency());
            if (request.desiredProficiency() != null) userSkill.setDesiredProficiency(request.desiredProficiency());
        } else if ("offer".equals(userSkill.getType())) {
            if (request.proficiencyLevel() != null) userSkill.setProficiencyLevel(request.proficiencyLevel());
            if (request.availability() != null) userSkill.setAvailability(request.availability());
        }

        return UserSkillResponse.from(userSkillRepository.save(userSkill));
    }

    @Transactional
    public void deleteSkill(Long userSkillId, Long userId) {
        UserSkill userSkill = userSkillRepository
                .findByIdAndUserId(userSkillId, userId)
                .orElseThrow(() -> ApiException.badRequest("Skill not found"));
        userSkillRepository.delete(userSkill);
    }
}
