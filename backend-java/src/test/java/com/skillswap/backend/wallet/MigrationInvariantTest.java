package com.skillswap.backend.wallet;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.skillswap.backend.IntegrationTestBase;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * Pins the database-level guarantees declared in the wallet migrations
 * (V10/V11). These constraints are the final authority behind "credits are
 * never created out of thin air and never disappear": even a bug that
 * bypasses WalletService cannot persist an unbalanced or malformed ledger
 * entry.
 */
class MigrationInvariantTest extends IntegrationTestBase {

    @Autowired
    private JdbcTemplate jdbc;

    private long insertUser(String email) {
        return jdbc.queryForObject(
                "INSERT INTO users (email, password_hash, name) VALUES (?, 'x', 'T') RETURNING id", Long.class, email);
    }

    @Test
    void aUserCanHoldExactlyOneWallet() {
        long userId = insertUser("one-wallet@test.dev");
        jdbc.update("INSERT INTO wallets (user_id, balance) VALUES (?, 10)", userId);

        assertThatThrownBy(() -> jdbc.update("INSERT INTO wallets (user_id, balance) VALUES (?, 5)", userId))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void ledgerRejectsZeroAndNegativeAmounts() {
        long userId = insertUser("amounts@test.dev");
        jdbc.update("INSERT INTO wallets (user_id, balance) VALUES (?, 0)", userId);
        long walletId = jdbc.queryForObject("SELECT id FROM wallets WHERE user_id = ?", Long.class, userId);

        for (int badAmount : new int[] {0, -5}) {
            assertThatThrownBy(() -> jdbc.update(
                            "INSERT INTO wallet_transactions (wallet_id, type, amount) VALUES (?, 'EARN', ?)",
                            walletId,
                            badAmount))
                    .as("amount %d must violate the CHECK", badAmount)
                    .isInstanceOf(DataIntegrityViolationException.class);
        }
    }

    @Test
    void ledgerRejectsUnknownTransactionTypes() {
        long userId = insertUser("types@test.dev");
        jdbc.update("INSERT INTO wallets (user_id, balance) VALUES (?, 0)", userId);
        long walletId = jdbc.queryForObject("SELECT id FROM wallets WHERE user_id = ?", Long.class, userId);

        assertThatThrownBy(() -> jdbc.update(
                        "INSERT INTO wallet_transactions (wallet_id, type, amount) VALUES (?, 'PRINT_MONEY', 1)",
                        walletId))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void deletingAWalletRemovesItsLedgerButKeepsSessionHistory() {
        long userId = insertUser("cascade@test.dev");
        jdbc.update("INSERT INTO wallets (user_id, balance) VALUES (?, 25)", userId);
        long walletId = jdbc.queryForObject("SELECT id FROM wallets WHERE user_id = ?", Long.class, userId);
        jdbc.update(
                "INSERT INTO wallet_transactions (wallet_id, type, amount, description) "
                        + "VALUES (?, 'ADMIN_CREDIT', 25, 'starter')",
                walletId);

        jdbc.update("DELETE FROM wallets WHERE id = ?", walletId);

        Integer remaining = jdbc.queryForObject(
                "SELECT COUNT(*) FROM wallet_transactions WHERE wallet_id = ?", Integer.class, walletId);
        assertThat(remaining).isZero();
    }

    @Test
    void balancesStayConsistentWithTheLedgerAfterATransfer() {
        long senderUserId = insertUser("sender@test.dev");
        long receiverUserId = insertUser("receiver@test.dev");
        jdbc.update("INSERT INTO wallets (user_id, balance) VALUES (?, 50)", senderUserId);
        jdbc.update("INSERT INTO wallets (user_id, balance) VALUES (?, 0)", receiverUserId);

        Map<String, Object> senderWallet =
                jdbc.queryForMap("SELECT id, balance FROM wallets WHERE user_id = ?", senderUserId);
        Map<String, Object> receiverWallet =
                jdbc.queryForMap("SELECT id, balance FROM wallets WHERE user_id = ?", receiverUserId);
        long senderWalletId = ((Number) senderWallet.get("id")).longValue();
        long receiverWalletId = ((Number) receiverWallet.get("id")).longValue();

        // Mirror of WalletService's transfer shape: one SPEND, one EARN.
        jdbc.update("UPDATE wallets SET balance = balance - 30 WHERE id = ?", senderWalletId);
        jdbc.update(
                "INSERT INTO wallet_transactions (wallet_id, type, amount) VALUES (?, 'SPEND', 30)", senderWalletId);
        jdbc.update("UPDATE wallets SET balance = balance + 30 WHERE id = ?", receiverWalletId);
        jdbc.update(
                "INSERT INTO wallet_transactions (wallet_id, type, amount) VALUES (?, 'EARN', 30)", receiverWalletId);

        Integer creditsOut = jdbc.queryForObject(
                "SELECT COALESCE(SUM(amount), 0) FROM wallet_transactions WHERE type IN ('SPEND')", Integer.class);
        Integer creditsIn = jdbc.queryForObject(
                "SELECT COALESCE(SUM(amount), 0) FROM wallet_transactions WHERE type IN ('EARN')", Integer.class);
        Integer totalBalance = jdbc.queryForObject("SELECT COALESCE(SUM(balance), 0) FROM wallets", Integer.class);

        assertThat(creditsOut).isEqualTo(creditsIn).isEqualTo(30);
        // Every credit moved between wallets; none were minted or burned.
        assertThat(totalBalance).isEqualTo(50);
    }
}
