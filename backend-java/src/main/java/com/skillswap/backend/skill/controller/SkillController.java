package com.skillswap.backend.skill.controller;

import com.skillswap.backend.auth.security.CustomUserDetails;
import com.skillswap.backend.skill.dto.AddSkillRequest;
import com.skillswap.backend.skill.dto.SkillCatalogResponse;
import com.skillswap.backend.skill.dto.UpdateSkillRequest;
import com.skillswap.backend.skill.dto.UserSkillResponse;
import com.skillswap.backend.skill.service.SkillService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    @PostMapping("/add")
    public Map<String, String> addSkill(
            @AuthenticationPrincipal CustomUserDetails principal, @Valid @RequestBody AddSkillRequest request) {
        skillService.addSkill(principal.getId(), request);
        return Map.of("message", "Skill added successfully");
    }

    @GetMapping("/get")
    public List<UserSkillResponse> getSkills(
            @AuthenticationPrincipal CustomUserDetails principal, @RequestParam String type) {
        return skillService.getSkills(principal.getId(), type);
    }

    @GetMapping({"", "/"})
    public List<SkillCatalogResponse> listCatalog() {
        return skillService.listCatalog();
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateSkill(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id,
            @RequestBody UpdateSkillRequest request) {
        UserSkillResponse updated = skillService.updateSkill(id, principal.getId(), request);
        return Map.of("message", "Skill updated successfully", "skill", updated);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> deleteSkill(
            @AuthenticationPrincipal CustomUserDetails principal, @PathVariable Long id) {
        skillService.deleteSkill(id, principal.getId());
        return Map.of("message", "Skill deleted successfully");
    }
}
