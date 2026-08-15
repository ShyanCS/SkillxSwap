package com.skillswap.backend.auth.controller;

import com.skillswap.backend.auth.dto.LoginRequest;
import com.skillswap.backend.auth.dto.RegisterRequest;
import com.skillswap.backend.auth.dto.RequestOtpRequest;
import com.skillswap.backend.auth.dto.ResetPasswordRequest;
import com.skillswap.backend.auth.dto.UserResponse;
import com.skillswap.backend.auth.dto.VerifyOtpRequest;
import com.skillswap.backend.auth.entity.User;
import com.skillswap.backend.auth.security.AuthCookieUtil;
import com.skillswap.backend.auth.security.CustomUserDetails;
import com.skillswap.backend.auth.security.JwtService;
import com.skillswap.backend.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final AuthCookieUtil cookieUtil;

    @PostMapping("/request-otp")
    public ResponseEntity<Map<String, String>> requestOtp(@Valid @RequestBody RequestOtpRequest request) {
        authService.requestOtp(request);
        return ResponseEntity.ok(Map.of("message", "OTP sent to email"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyOtp(request);
        return ResponseEntity.ok(Map.of("message", "OTP verified"));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.register(request);
        String token = jwtService.generateToken(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, cookieUtil.buildTokenCookie(token).toString())
                .body(Map.of("message", "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody LoginRequest request) {
        User user = authService.login(request);
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieUtil.buildTokenCookie(token).toString())
                .body(Map.of("message", "User Loggedin Sucessfully!"));
    }

    @PostMapping("/reset")
    public ResponseEntity<Map<String, String>> reset(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Password changed successfully"));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieUtil.buildExpiredTokenCookie().toString())
                .body(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, UserResponse>> me(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(Map.of("user", UserResponse.from(principal.getUser())));
    }
}
