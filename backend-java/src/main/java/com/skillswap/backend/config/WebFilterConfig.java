package com.skillswap.backend.config;

import com.skillswap.backend.common.logging.RequestIdFilter;
import com.skillswap.backend.common.ratelimit.RateLimitFilter;
import com.skillswap.backend.common.ratelimit.RateLimiterService;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;

@Configuration
public class WebFilterConfig {

    /**
     * Outermost filter so even rate-limit rejections carry a request id and can
     * be correlated in the logs.
     */
    @Bean
    public FilterRegistrationBean<RequestIdFilter> requestIdFilterRegistration() {
        FilterRegistrationBean<RequestIdFilter> registration = new FilterRegistrationBean<>(new RequestIdFilter());
        registration.addUrlPatterns("/*");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }

    /**
     * Registered ahead of the Spring Security filter chain so abusive requests
     * are rejected before any authentication or database work happens.
     *
     * Registered explicitly (rather than annotating the filter @Component) so
     * the ordering is deliberate and the filter only runs on real requests,
     * not on internal /error forwards.
     */
    @Bean
    public FilterRegistrationBean<RateLimitFilter> rateLimitFilterRegistration(RateLimiterService rateLimiter) {
        FilterRegistrationBean<RateLimitFilter> registration =
                new FilterRegistrationBean<>(new RateLimitFilter(rateLimiter));
        registration.addUrlPatterns("/api/*");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE + 10);
        return registration;
    }
}
