package com.skillswap.backend.auth.entity;

import com.skillswap.backend.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(columnDefinition = "text")
    private String bio;

    @Column(length = 120)
    private String region;

    @Column(length = 60)
    private String timezone;

    @Column(name = "profile_picture_url", length = 500)
    private String profilePictureUrl;

    @Column(name = "karma_points", nullable = false)
    @Builder.Default
    private Integer karmaPoints = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.USER;

    @Column(name = "average_rating", nullable = false)
    @Builder.Default
    private java.math.BigDecimal averageRating = java.math.BigDecimal.ZERO;

    @Column(name = "rating_count", nullable = false)
    @Builder.Default
    private Integer ratingCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean enabled = true;
}
