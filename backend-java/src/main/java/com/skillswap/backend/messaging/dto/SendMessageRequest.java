package com.skillswap.backend.messaging.dto;

import jakarta.validation.constraints.NotBlank;

public record SendMessageRequest(@NotBlank String body) {
}
