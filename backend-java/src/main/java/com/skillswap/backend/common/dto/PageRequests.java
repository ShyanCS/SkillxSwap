package com.skillswap.backend.common.dto;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Builds a {@link Pageable} from raw query params.
 *
 * The clamp is the point: page size arrives from the client, so an unbounded
 * value lets anyone ask for the entire table in one request and turn a
 * paginated endpoint back into the unbounded one it replaced. Sizes are pinned
 * into a sane range and negative page numbers are floored rather than rejected,
 * since a 400 here would be a worse experience than simply serving page 0.
 */
public final class PageRequests {

    public static final int MAX_PAGE_SIZE = 100;
    public static final int DEFAULT_PAGE_SIZE = 20;

    private PageRequests() {
    }

    public static Pageable of(Integer page, Integer size) {
        return PageRequest.of(normalizePage(page), normalizeSize(size));
    }

    public static Pageable of(Integer page, Integer size, Sort sort) {
        return PageRequest.of(normalizePage(page), normalizeSize(size), sort);
    }

    private static int normalizePage(Integer page) {
        return page == null || page < 0 ? 0 : page;
    }

    private static int normalizeSize(Integer size) {
        if (size == null || size < 1) {
            return DEFAULT_PAGE_SIZE;
        }
        return Math.min(size, MAX_PAGE_SIZE);
    }
}
