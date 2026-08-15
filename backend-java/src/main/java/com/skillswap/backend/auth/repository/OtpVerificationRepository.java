package com.skillswap.backend.auth.repository;

import com.skillswap.backend.auth.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.Optional;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    // Mirrors the current Node/Redis contract: OTP state is keyed by email only
    // (not by purpose) -- purpose is recorded for audit but registration/reset
    // eligibility is already mutually exclusive by email existing or not.
    Optional<OtpVerification> findFirstByEmailAndExpiresAtAfterOrderByIdDesc(
            String email, OffsetDateTime now);

    Optional<OtpVerification> findFirstByEmailAndVerifiedTrueAndExpiresAtAfterOrderByIdDesc(
            String email, OffsetDateTime now);
}
