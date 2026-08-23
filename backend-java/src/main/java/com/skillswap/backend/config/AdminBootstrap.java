package com.skillswap.backend.config;

import com.skillswap.backend.auth.entity.Role;
import com.skillswap.backend.auth.entity.User;
import com.skillswap.backend.auth.repository.UserRepository;
import java.util.Locale;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Promotes a configured email to ADMIN on startup so a fresh deployment has a
 * working admin without hand-editing Postgres.
 *
 * This deliberately promotes an *existing* account rather than creating one:
 * generating a user would mean inventing a password, which would either be
 * logged, be weak, or need another secret to configure. Registering through the
 * normal flow keeps password handling in one place. So the operator registers
 * normally, then this grants the role on the next boot.
 *
 * Idempotent -- a no-op once the account already holds the role, so leaving the
 * variable set across restarts is harmless.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootstrap {

    private final UserRepository userRepository;

    @Value("${app.admin.bootstrap-email:}")
    private String bootstrapEmail;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void promoteBootstrapAdmin() {
        if (bootstrapEmail == null || bootstrapEmail.isBlank()) {
            return;
        }
        // Matches AuthService's normalization; a locale-sensitive toLowerCase
        // would not round-trip 'I' under a Turkish default locale.
        String email = bootstrapEmail.trim().toLowerCase(Locale.ROOT);

        Optional<User> found = userRepository.findByEmail(email);
        if (found.isEmpty()) {
            log.warn(
                    "ADMIN_BOOTSTRAP_EMAIL is set to '{}' but no such account exists yet. "
                            + "Register that email through the normal signup flow, then restart to grant admin.",
                    email);
            return;
        }

        User user = found.get();
        if (user.getRole() == Role.ADMIN) {
            log.debug("Bootstrap admin '{}' already has the ADMIN role; nothing to do.", email);
            return;
        }

        user.setRole(Role.ADMIN);
        userRepository.save(user);
        log.info("Granted ADMIN to bootstrap account '{}'.", email);
    }
}
