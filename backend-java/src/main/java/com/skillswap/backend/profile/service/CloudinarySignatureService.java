package com.skillswap.backend.profile.service;

import com.skillswap.backend.profile.dto.CloudinarySignatureResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Computes a Cloudinary signed-upload signature without pulling in the full
 * Cloudinary Java SDK -- the actual file upload happens client-side directly
 * to Cloudinary (same as the Node flow this replaces), we only need to sign
 * the upload params server-side so the API secret never reaches the browser.
 *
 * Algorithm: sort params alphabetically by key, join as "k=v&k2=v2", append
 * the API secret, SHA-1, hex-encode. This matches Cloudinary's documented
 * signature scheme and cloudinary.utils.api_sign_request() in the Node SDK.
 */
@Service
public class CloudinarySignatureService {

    private static final String FOLDER = "profiles";

    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;

    public CloudinarySignatureService(
            @Value("${app.cloudinary.cloud-name}") String cloudName,
            @Value("${app.cloudinary.api-key}") String apiKey,
            @Value("${app.cloudinary.api-secret}") String apiSecret) {
        this.cloudName = cloudName;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    public CloudinarySignatureResponse generateSignature() {
        long timestamp = System.currentTimeMillis() / 1000;
        String paramsToSign = "folder=" + FOLDER + "&timestamp=" + timestamp;
        String signature = sha1Hex(paramsToSign + apiSecret);
        return new CloudinarySignatureResponse(signature, timestamp, apiKey, cloudName, FOLDER);
    }

    private String sha1Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-1 not available", e);
        }
    }
}
