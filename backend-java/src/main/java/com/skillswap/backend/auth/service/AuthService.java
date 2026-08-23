package com.skillswap.backend.auth.service;

import com.skillswap.backend.auth.dto.LoginRequest;
import com.skillswap.backend.auth.dto.RegisterRequest;
import com.skillswap.backend.auth.dto.RequestOtpRequest;
import com.skillswap.backend.auth.dto.ResetPasswordRequest;
import com.skillswap.backend.auth.dto.VerifyOtpRequest;
import com.skillswap.backend.auth.entity.OtpPurpose;
import com.skillswap.backend.auth.entity.User;
import com.skillswap.backend.auth.repository.UserRepository;
import com.skillswap.backend.common.exception.ApiException;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final PasswordEncoder passwordEncoder;

    public void requestOtp(RequestOtpRequest request) {
        String email = normalize(request.email());
        boolean exists = userRepository.existsByEmail(email);
        OtpPurpose purpose = parsePurpose(request.purpose());

        if (purpose == OtpPurpose.REGISTER && exists) {
            throw ApiException.badRequest("Email already in use");
        }
        if (purpose == OtpPurpose.RESET && !exists) {
            throw ApiException.badRequest("Invalid email");
        }

        otpService.requestOtp(email, purpose);
    }

    public void verifyOtp(VerifyOtpRequest request) {
        otpService.verifyOtp(normalize(request.email()), request.otp());
    }

    @Transactional
    public User register(RegisterRequest request) {
        String email = normalize(request.email());
        if (userRepository.existsByEmail(email)) {
            throw ApiException.badRequest("Email already in use");
        }
        otpService.requireVerified(email);

        User user = User.builder()
                .name(capitalize(request.name()))
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .build();
        User saved = userRepository.save(user);

        otpService.consumeVerification(email);
        return saved;
    }

    public User login(LoginRequest request) {
        String email = normalize(request.email());
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> ApiException.badRequest("Email or Password is invalid"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw ApiException.badRequest("Email or Password is invalid");
        }
        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw ApiException.forbidden("This account has been suspended");
        }
        return user;
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String email = normalize(request.email());
        User user = userRepository.findByEmail(email).orElseThrow(() -> ApiException.badRequest("Invalid Email"));

        otpService.requireVerified(email);

        user.setPasswordHash(passwordEncoder.encode(request.password()));
        userRepository.save(user);

        otpService.consumeVerification(email);
    }

    private OtpPurpose parsePurpose(String purpose) {
        return "register".equalsIgnoreCase(purpose) ? OtpPurpose.REGISTER : OtpPurpose.RESET;
    }

    private String normalize(String email) {
        return email.toLowerCase(Locale.ROOT);
    }

    private String capitalize(String name) {
        String[] words = name.toLowerCase(Locale.ROOT).trim().split("\\s+");
        StringBuilder result = new StringBuilder();
        for (String word : words) {
            if (word.isEmpty()) continue;
            if (!result.isEmpty()) result.append(' ');
            result.append(Character.toUpperCase(word.charAt(0))).append(word.substring(1));
        }
        return result.toString();
    }
}
