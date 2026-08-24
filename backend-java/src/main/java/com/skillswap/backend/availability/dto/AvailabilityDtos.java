package com.skillswap.backend.availability.dto;

import com.skillswap.backend.availability.entity.AvailabilitySlot;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public final class AvailabilityDtos {

    private AvailabilityDtos() {}

    /** Minutes from midnight in the owning user's timezone; 1440 = end of day. */
    public record SlotDto(
            @NotNull @Min(1) @Max(7) Short dayOfWeek,
            @NotNull @Min(0) @Max(1439) Short startMinute,
            @NotNull @Min(1) @Max(1440) Short endMinute) {
        public static SlotDto from(AvailabilitySlot slot) {
            return new SlotDto(slot.getDayOfWeek(), slot.getStartMinute(), slot.getEndMinute());
        }
    }

    /**
     * The timezone is echoed back because the slots are meaningless without it
     * -- a client rendering them has to know which zone they are expressed in.
     */
    public record AvailabilityResponse(String timezone, List<SlotDto> slots) {}

    /**
     * Replaces the whole week rather than patching individual slots: an
     * availability editor is a single "here is my week" save, and per-slot
     * mutation would need client-side id tracking for no benefit.
     */
    public record UpdateAvailabilityRequest(
            @Valid @NotNull @Size(max = 50, message = "Too many availability slots") List<SlotDto> slots) {}

    /** Whether a proposed session time works, and why not when it doesn't. */
    public record SlotCheckResponse(boolean available, List<String> conflicts) {}
}
