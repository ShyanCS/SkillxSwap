package com.skillswap.backend.session.controller;

import com.skillswap.backend.auth.security.CustomUserDetails;
import com.skillswap.backend.session.dto.CreateSessionRequest;
import com.skillswap.backend.session.dto.SchedulableMatchResponse;
import com.skillswap.backend.session.dto.SessionResponse;
import com.skillswap.backend.session.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @GetMapping("/schedulable-matches")
    public List<SchedulableMatchResponse> schedulableMatches(@AuthenticationPrincipal CustomUserDetails principal) {
        return sessionService.getSchedulableMatches(principal.getId());
    }

    @PostMapping
    public SessionResponse create(@AuthenticationPrincipal CustomUserDetails principal,
                                   @Valid @RequestBody CreateSessionRequest request) {
        return sessionService.createSession(principal.getId(), request);
    }

    @GetMapping
    public List<SessionResponse> mySessions(@AuthenticationPrincipal CustomUserDetails principal) {
        return sessionService.getMySessions(principal.getId());
    }

    @PutMapping("/{id}/cancel")
    public SessionResponse cancel(@AuthenticationPrincipal CustomUserDetails principal, @PathVariable Long id) {
        return sessionService.updateStatus(id, principal.getId(), "Cancelled");
    }

    @PutMapping("/{id}/complete")
    public SessionResponse complete(@AuthenticationPrincipal CustomUserDetails principal, @PathVariable Long id) {
        return sessionService.updateStatus(id, principal.getId(), "Completed");
    }
}
