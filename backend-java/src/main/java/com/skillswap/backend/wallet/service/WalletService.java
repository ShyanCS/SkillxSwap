package com.skillswap.backend.wallet.service;

import com.skillswap.backend.auth.repository.UserRepository;
import com.skillswap.backend.session.entity.Session;
import com.skillswap.backend.wallet.dto.WalletResponse;
import com.skillswap.backend.wallet.dto.WalletTransactionResponse;
import com.skillswap.backend.wallet.entity.Wallet;
import com.skillswap.backend.wallet.entity.WalletTransaction;
import com.skillswap.backend.wallet.repository.WalletRepository;
import com.skillswap.backend.wallet.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WalletService {

    private static final int STARTER_BALANCE = 5;

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final UserRepository userRepository;

    @Transactional
    public Wallet getOrCreateWallet(Long userId) {
        return walletRepository.findByUserId(userId).orElseGet(() -> {
            Wallet wallet = Wallet.builder()
                    .user(userRepository.getReferenceById(userId))
                    .balance(STARTER_BALANCE)
                    .build();
            Wallet saved = walletRepository.save(wallet);
            walletTransactionRepository.save(WalletTransaction.builder()
                    .wallet(saved)
                    .type("ADMIN_CREDIT")
                    .amount(STARTER_BALANCE)
                    .description("Starter balance")
                    .build());
            return saved;
        });
    }

    @Transactional
    public WalletResponse getWallet(Long userId) {
        Wallet wallet = getOrCreateWallet(userId);
        var transactions = walletTransactionRepository.findByWalletIdOrderByIdDesc(wallet.getId()).stream()
                .map(WalletTransactionResponse::from)
                .toList();
        return new WalletResponse(wallet.getBalance(), transactions);
    }

    /** Credits per minute of session duration, rounded, minimum 1. */
    public int creditsForSession(Session session) {
        return Math.max(1, Math.round(session.getDurationMinutes() / 30f));
    }

    @Transactional
    public void transferForSession(Session session) {
        int amount = creditsForSession(session);
        String skillName = session.getSkill().getName();

        Wallet teacherWallet = getOrCreateWallet(session.getTeacher().getId());
        teacherWallet.setBalance(teacherWallet.getBalance() + amount);
        walletRepository.save(teacherWallet);
        walletTransactionRepository.save(WalletTransaction.builder()
                .wallet(teacherWallet)
                .session(session)
                .type("EARN")
                .amount(amount)
                .description("Taught " + skillName)
                .build());

        Wallet learnerWallet = getOrCreateWallet(session.getLearner().getId());
        learnerWallet.setBalance(learnerWallet.getBalance() - amount);
        walletRepository.save(learnerWallet);
        walletTransactionRepository.save(WalletTransaction.builder()
                .wallet(learnerWallet)
                .session(session)
                .type("SPEND")
                .amount(amount)
                .description("Learned " + skillName)
                .build());
    }
}
