package com.pht.dev_edu.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

@Configuration
public class CommonConfig {
    @Bean
    Executor taskExecutor() {
        return Executors.newThreadPerTaskExecutor(Thread.ofVirtual()
                .name("virtual-thread-", 0) // prefix + auto increment
                .factory()
        );
    }
}
