package com.skillswap.backend.auth.service;

import com.skillswap.backend.auth.entity.OtpPurpose;
import com.skillswap.backend.auth.entity.OtpVerification;
import com.skillswap.backend.auth.repository.OtpVerificationRepository;
import com.skillswap.backend.common.exception.ApiException;
import com.skillswap.backend.common.mail.MailService;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OtpService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final OtpVerificationRepository otpVerificationRepository;
    private final MailService mailService;

    @Value("${app.otp.ttl-minutes}")
    private int ttlMinutes;

    public void requestOtp(String email, OtpPurpose purpose) {
        String otp = generateSixDigitOtp();
        OtpVerification verification = OtpVerification.builder()
                .email(email)
                .otpCode(otp)
                .purpose(purpose)
                .verified(false)
                .expiresAt(OffsetDateTime.now().plusMinutes(ttlMinutes))
                .build();
        otpVerificationRepository.save(verification);
        // Synchronous on purpose: the UI tells the member to go check their
        // inbox, so a delivery failure has to surface as an error here rather
        // than leave them waiting for a code that never sends.
        mailService.sendSync(
                email,
                "Your SkillSwap verification code",
                "Your OTP is " + otp + ". It expires in " + ttlMinutes + " minutes.");
    }

    public void verifyOtp(String email, String otp) {
        OtpVerification verification = otpVerificationRepository
                .findFirstByEmailAndExpiresAtAfterOrderByIdDesc(email, OffsetDateTime.now())
                .orElseThrow(() -> ApiException.badRequest("Invalid or expired OTP"));

        if (!verification.getOtpCode().equals(otp)) {
            throw ApiException.badRequest("Invalid or expired OTP");
        }

        verification.setVerified(true);
        otpVerificationRepository.save(verification);
    }

    public void requireVerified(String email) {
        boolean verified = otpVerificationRepository
                .findFirstByEmailAndVerifiedTrueAndExpiresAtAfterOrderByIdDesc(email, OffsetDateTime.now())
                .isPresent();
        if (!verified) {
            throw ApiException.badRequest("OTP not verified");
        }
    }

    /** Mirrors Node's `redis.del('otp-verified:<email>')` after a successful register/reset. */
    public void consumeVerification(String email) {
        otpVerificationRepository
                .findFirstByEmailAndVerifiedTrueAndExpiresAtAfterOrderByIdDesc(email, OffsetDateTime.now())
                .ifPresent(verification -> {
                    verification.setExpiresAt(OffsetDateTime.now());
                    otpVerificationRepository.save(verification);
                });
    }

    private String generateSixDigitOtp() {
        int otp = 100000 + RANDOM.nextInt(900000);
        return String.valueOf(otp);
    }
}
