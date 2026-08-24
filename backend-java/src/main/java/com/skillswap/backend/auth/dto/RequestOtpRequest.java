package com.skillswap.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RequestOtpRequest(
        @NotBlank @Email String email,
        @NotBlank @Pattern(regexp = "register|reset", message = "must be 'register' or 'reset'") String purpose) {}
