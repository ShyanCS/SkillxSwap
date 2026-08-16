package com.skillswap.backend.ai.controller;

import com.skillswap.backend.ai.dto.AiDtos;
import com.skillswap.backend.ai.service.AiAssistantService;
import com.skillswap.backend.auth.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Rate limited to {@code app.ratelimit.ai-per-hour} per client IP by
 * RateLimitFilter -- every call here costs real money upstream.
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiAssistantService aiAssistantService;

    /** Lets the UI hide or disable the feature instead of failing on first use. */
    @GetMapping("/status")
    public Map<String, Boolean> status() {
        return Map.of("available", aiAssistantService.isConfigured());
    }

    @PostMapping("/ask")
    public AiDtos.AskResponse ask(@AuthenticationPrincipal CustomUserDetails principal,
                                   @Valid @RequestBody AiDtos.AskRequest request) {
        return aiAssistantService.ask(principal.getId(), request.question());
    }
}
