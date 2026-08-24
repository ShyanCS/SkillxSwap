package com.skillswap.backend.availability.entity;

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

/**
 * One recurring weekly window during which a user is open to sessions.
 *
 * Minutes are local to the owning user's timezone -- see V19 for why.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "user_availability")
public class AvailabilitySlot extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** ISO-8601: 1 = Monday .. 7 = Sunday, matching java.time.DayOfWeek#getValue. */
    @Column(name = "day_of_week", nullable = false)
    private Short dayOfWeek;

    @Column(name = "start_minute", nullable = false)
    private Short startMinute;

    @Column(name = "end_minute", nullable = false)
    private Short endMinute;
}
