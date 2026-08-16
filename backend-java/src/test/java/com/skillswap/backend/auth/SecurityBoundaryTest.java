package com.skillswap.backend.auth;

import com.skillswap.backend.IntegrationTestBase;
import com.skillswap.backend.auth.entity.Role;
import com.skillswap.backend.auth.entity.User;
import com.skillswap.backend.auth.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import jakarta.servlet.http.Cookie;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * Access-control boundaries. These are the checks whose failure is silent and
 * expensive: an endpoint that quietly stops enforcing a role looks completely
 * normal until someone notices the data.
 */
class SecurityBoundaryTest extends IntegrationTestBase {

    private static final String PASSWORD = "correct-horse-battery";

    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("protected endpoints reject anonymous callers")
    void anonymousIsRejected() throws Exception {
        mockMvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/dashboard")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/wallet")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("a normal user is forbidden from admin endpoints")
    void nonAdminCannotReachAdminApi() throws Exception {
        createUser("member@example.com", Role.USER, true);
        Cookie token = login("member@example.com");

        // 403 (authenticated but unauthorised), not 401 -- the distinction was
        // previously lost because the /error forward re-entered the filter chain.
        mockMvc.perform(get("/api/admin/stats").cookie(token)).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/admin/users").cookie(token)).andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("an admin can reach admin endpoints")
    void adminCanReachAdminApi() throws Exception {
        createUser("boss@example.com", Role.ADMIN, true);
        Cookie token = login("boss@example.com");

        mockMvc.perform(get("/api/admin/stats").cookie(token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").exists());
    }

    @Test
    @DisplayName("a suspended account cannot log in")
    void suspendedUserCannotLogIn() throws Exception {
        createUser("banned@example.com", Role.USER, false);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody("banned@example.com")))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("a suspended account's existing session stops working immediately")
    void suspendingRevokesLiveSessions() throws Exception {
        User user = createUser("soon-banned@example.com", Role.USER, true);
        Cookie token = login("soon-banned@example.com");

        mockMvc.perform(get("/api/auth/me").cookie(token)).andExpect(status().isOk());

        user.setEnabled(false);
        userRepository.save(user);

        // The JWT is still cryptographically valid; the filter must re-check
        // account state rather than trust the signature alone.
        mockMvc.perform(get("/api/auth/me").cookie(token)).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("login rejects a wrong password without revealing which field was wrong")
    void wrongPasswordIsRejected() throws Exception {
        createUser("real@example.com", Role.USER, true);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"real@example.com\",\"password\":\"wrong\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email or Password is invalid"));
    }

    @Test
    @DisplayName("registration is refused without a verified OTP")
    void registrationRequiresVerifiedOtp() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Sneaky","email":"sneaky@example.com","password":"password123"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("OTP not verified"));

        assertThat(userRepository.findByEmail("sneaky@example.com")).isEmpty();
    }

    @Test
    @DisplayName("the auth cookie is httpOnly so scripts can't read it")
    void authCookieIsHttpOnly() throws Exception {
        createUser("cookie@example.com", Role.USER, true);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody("cookie@example.com")))
                .andExpect(status().isOk())
                .andExpect(cookie().httpOnly("token", true));
    }

    // ---------- fixtures ----------

    private User createUser(String email, Role role, boolean enabled) {
        return userRepository.save(User.builder()
                .name(email.split("@")[0])
                .email(email)
                .passwordHash(passwordEncoder.encode(PASSWORD))
                .role(role)
                .enabled(enabled)
                .build());
    }

    private String loginBody(String email) {
        return "{\"email\":\"" + email + "\",\"password\":\"" + PASSWORD + "\"}";
    }

    private Cookie login(String email) throws Exception {
        return mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(email)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getCookie("token");
    }
}
