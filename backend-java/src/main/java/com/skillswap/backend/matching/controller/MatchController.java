package com.skillswap.backend.matching.controller;

import com.skillswap.backend.auth.security.CustomUserDetails;
import com.skillswap.backend.matching.dto.MatchRequestResponse;
import com.skillswap.backend.matching.dto.MatchResultResponse;
import com.skillswap.backend.matching.dto.RespondRequest;
import com.skillswap.backend.matching.dto.SendMatchRequestRequest;
import com.skillswap.backend.matching.service.MatchRequestService;
import com.skillswap.backend.matching.service.MatchingService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/match-requests")
@RequiredArgsConstructor
public class MatchController {

    private final MatchingService matchingService;
    private final MatchRequestService matchRequestService;

    @GetMapping("/matches")
    public List<MatchResultResponse> matches(@AuthenticationPrincipal CustomUserDetails principal) {
        return matchingService.computeMatches(principal.getId());
    }

    @PostMapping
    public Map<String, String> sendRequest(
            @AuthenticationPrincipal CustomUserDetails principal, @Valid @RequestBody SendMatchRequestRequest request) {
        matchRequestService.sendRequest(principal.getId(), request);
        return Map.of("message", "Match request sent");
    }

    @GetMapping("/incoming")
    public List<MatchRequestResponse> incoming(@AuthenticationPrincipal CustomUserDetails principal) {
        return matchRequestService.getIncoming(principal.getId());
    }

    @GetMapping("/sent")
    public List<MatchRequestResponse> sent(@AuthenticationPrincipal CustomUserDetails principal) {
        return matchRequestService.getSent(principal.getId());
    }

    @PutMapping("/{id}")
    public Map<String, Object> respond(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody RespondRequest request) {
        MatchRequestResponse updated = matchRequestService.respond(id, principal.getId(), request);
        return Map.of("message", "Request " + request.status(), "request", updated);
    }
}
