package com.orb.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync
public class AsyncConfig {
    // @EnableAsync enables Spring's @Async annotation processing
    // Used for non-blocking email notifications on incoming transfers
}
