package com.skillswap.backend.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AiDtos {

    private AiDtos() {}

    /** Question length is capped so a single request can't run up a large token bill. */
    public record AskRequest(
            @NotBlank @Size(max = 2000, message = "must be 2000 characters or fewer") String question) {}

    public record AskResponse(String answer, boolean available) {

        public static AskResponse unavailable(String reason) {
            return new AskResponse(reason, false);
        }

        public static AskResponse of(String answer) {
            return new AskResponse(answer, true);
        }
    }
}
