package com.skillswap.backend.wallet.repository;

import com.skillswap.backend.wallet.entity.WalletTransaction;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    List<WalletTransaction> findByWalletIdOrderByIdDesc(Long walletId);
}
