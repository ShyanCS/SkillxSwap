package com.skillswap.backend.availability.controller;

import com.skillswap.backend.auth.security.CustomUserDetails;
import com.skillswap.backend.availability.dto.AvailabilityDtos.AvailabilityResponse;
import com.skillswap.backend.availability.dto.AvailabilityDtos.UpdateAvailabilityRequest;
import com.skillswap.backend.availability.service.AvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping
    public AvailabilityResponse myAvailability(@AuthenticationPrincipal CustomUserDetails principal) {
        return availabilityService.getAvailability(principal.getId());
    }

    @PutMapping
    public AvailabilityResponse updateAvailability(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody UpdateAvailabilityRequest request) {
        return availabilityService.replaceAvailability(principal.getId(), request.slots());
    }

    /**
     * A partner's availability, so the scheduling UI can show when they are
     * free before a time is proposed. Readable by any authenticated user --
     * it exposes no more than the scheduling flow already reveals by
     * accepting or rejecting a proposed time.
     */
    @GetMapping("/{userId}")
    public AvailabilityResponse userAvailability(@PathVariable Long userId) {
        return availabilityService.getAvailability(userId);
    }
}
