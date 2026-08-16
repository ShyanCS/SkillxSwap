package com.skillswap.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
@EnableAsync
public class AsyncConfig {

    private static final Logger log = LoggerFactory.getLogger(AsyncConfig.class);

    /**
     * Dedicated pool for outbound email so a slow SMTP server can't starve
     * request handling.
     *
     * The queue is bounded and the rejection policy is CallerRuns: if the mail
     * backlog ever exceeds capacity, the calling thread sends the message
     * itself. That deliberately slows the caller down instead of silently
     * dropping notifications, which is the failure mode an unbounded queue
     * would eventually turn into an OutOfMemoryError.
     */
    @Bean("mailExecutor")
    public Executor mailExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("mail-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        // Let in-flight sends finish during a graceful shutdown.
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(15);
        executor.initialize();
        log.info("Mail executor initialised (core=2, max=5, queue=500)");
        return executor;
    }
}
