package com.skillswap.backend.wallet.dto;

import com.skillswap.backend.wallet.entity.WalletTransaction;
import java.time.OffsetDateTime;

public record WalletTransactionResponse(
        Long id, String type, Integer amount, String description, Long sessionId, OffsetDateTime createdAt) {
    public static WalletTransactionResponse from(WalletTransaction tx) {
        return new WalletTransactionResponse(
                tx.getId(),
                tx.getType(),
                tx.getAmount(),
                tx.getDescription(),
                tx.getSession() != null ? tx.getSession().getId() : null,
                tx.getCreatedAt());
    }
}
