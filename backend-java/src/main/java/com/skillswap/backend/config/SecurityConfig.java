package com.skillswap.backend.config;

import com.skillswap.backend.auth.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandlerImpl;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;

    @org.springframework.beans.factory.annotation.Value("${app.cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Strength 10, matching the current Node bcrypt.hash(password, 10).
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Stateless JWT-in-cookie API. CSRF is intentionally disabled here for
                // parity with the current Node app (its `csurf` dependency is installed
                // but never wired into any route); risk is mitigated via SameSite on the
                // auth cookie rather than a CSRF token.
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                        // Explicit, rather than relying on the framework's default
                        // authenticated-vs-anonymous resolution to pick 403 over 401
                        // for an authenticated-but-insufficient-role request.
                        .accessDeniedHandler(new AccessDeniedHandlerImpl()))
                .authorizeHttpRequests(auth -> auth
                        // AccessDeniedHandlerImpl's sendError(403) triggers a container
                        // forward to /error, which re-enters this filter chain as a new,
                        // anonymous request. Without this, that forwarded request itself
                        // gets denied and translated to 401, clobbering the real 403.
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/api/health").permitAll()
                        .requestMatchers("/api/auth/request-otp", "/api/auth/verify-otp",
                                "/api/auth/register", "/api/auth/login", "/api/auth/reset").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    private CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
