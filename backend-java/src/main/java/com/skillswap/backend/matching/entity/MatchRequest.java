package com.skillswap.backend.matching.entity;

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
 * senderOfferedUserSkillIds / receiverOfferedUserSkillIds always reference
 * each side's own OFFER-type user_skills rows (the skills they'll teach) --
 * unambiguous regardless of whether a caller is viewing this as an incoming
 * or a sent request. See SendMatchRequestRequest for the wire contract.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "match_requests")
public class MatchRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "Pending";

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "sender_offered_user_skill_ids", columnDefinition = "bigint[]")
    @Builder.Default
    private Long[] senderOfferedUserSkillIds = new Long[0];

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "receiver_offered_user_skill_ids", columnDefinition = "bigint[]")
    @Builder.Default
    private Long[] receiverOfferedUserSkillIds = new Long[0];
}
