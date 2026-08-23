package com.skillswap.backend.skill.entity;

import com.skillswap.backend.auth.entity.User;
import com.skillswap.backend.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * type/proficiencyLevel/desiredProficiency/urgency/status are plain strings
 * (not Java enums) so the exact casing the frontend's fixed option lists use
 * ("offer", "Beginner", "Low", "Active", ...) round-trips without translation
 * -- integrity is enforced by CHECK constraints in the migration instead.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "user_skills")
public class UserSkill extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(nullable = false, length = 10)
    private String type;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "proficiency_level", length = 20)
    private String proficiencyLevel;

    @Column(name = "desired_proficiency", length = 20)
    private String desiredProficiency;

    @Column(length = 10)
    private String urgency;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private String[] availability;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "Active";
}
