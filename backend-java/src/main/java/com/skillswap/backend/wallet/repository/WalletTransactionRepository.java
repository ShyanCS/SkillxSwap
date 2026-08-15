package com.skillswap.backend.wallet.repository;

import com.skillswap.backend.wallet.entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    List<WalletTransaction> findByWalletIdOrderByIdDesc(Long walletId);
}
