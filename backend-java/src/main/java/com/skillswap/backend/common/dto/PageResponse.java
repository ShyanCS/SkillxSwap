package com.skillswap.backend.common.dto;

import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

/**
 * Transport shape for paginated endpoints.
 *
 * Spring's own {@link Page} is deliberately not returned over the wire: its
 * JSON shape is an implementation detail that has changed between Spring
 * versions, and it serializes the whole Pageable/Sort object graph, which
 * clients have no use for.
 */
public record PageResponse<T>(
        List<T> items,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasNext
) {
    public static <E, T> PageResponse<T> of(Page<E> page, Function<E, T> mapper) {
        return new PageResponse<>(
                page.getContent().stream().map(mapper).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.hasNext()
        );
    }
}
