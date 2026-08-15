package com.skillswap.backend.admin.service;

import com.skillswap.backend.admin.dto.AdminStatsResponse;
import com.skillswap.backend.admin.dto.AdminUserResponse;
import com.skillswap.backend.auth.entity.User;
import com.skillswap.backend.auth.repository.UserRepository;
import com.skillswap.backend.common.exception.ApiException;
import com.skillswap.backend.report.repository.ReportRepository;
import com.skillswap.backend.session.repository.SessionRepository;
import com.skillswap.backend.skill.dto.SkillCatalogResponse;
import com.skillswap.backend.skill.repository.SkillRepository;
import com.skillswap.backend.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final SessionRepository sessionRepository;
    private final WalletRepository walletRepository;
    private final ReportRepository reportRepository;

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        return new AdminStatsResponse(
                userRepository.count(),
                skillRepository.count(),
                sessionRepository.countByStatus("Scheduled"),
                sessionRepository.countByStatus("Completed"),
                walletRepository.sumAllBalances(),
                reportRepository.countByStatus("Open")
        );
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getUsers() {
        return userRepository.findAll().stream()
                .map(AdminUserResponse::from)
                .toList();
    }

    @Transactional
    public AdminUserResponse setUserEnabled(Long userId, boolean enabled, Long adminId) {
        if (userId.equals(adminId) && !enabled) {
            throw ApiException.badRequest("You cannot suspend your own account");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        user.setEnabled(enabled);
        return AdminUserResponse.from(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<SkillCatalogResponse> getSkills() {
        return skillRepository.findAll().stream()
                .map(SkillCatalogResponse::from)
                .toList();
    }

    @Transactional
    public void deleteSkill(Long skillId) {
        if (!skillRepository.existsById(skillId)) {
            throw ApiException.notFound("Skill not found");
        }
        try {
            skillRepository.deleteById(skillId);
        } catch (Exception e) {
            throw ApiException.badRequest("Cannot delete a skill that's still in use");
        }
    }
}
