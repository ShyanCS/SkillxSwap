package com.skillswap.backend.wallet.repository;

import com.skillswap.backend.wallet.entity.Wallet;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByUserId(Long userId);

    @Query("select coalesce(sum(w.balance), 0) from Wallet w")
    long sumAllBalances();
}
