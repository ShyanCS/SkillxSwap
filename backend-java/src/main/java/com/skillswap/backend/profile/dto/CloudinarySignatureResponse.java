package com.skillswap.backend.profile.dto;

public record CloudinarySignatureResponse(
        String signature, long timestamp, String apiKey, String cloudName, String folder) {}
