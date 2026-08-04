package com.pht.dev_edu.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

@Configuration
@EnableScheduling
public class CommonConfig {
    @Bean
    @Primary
    Executor taskExecutor() {
        return Executors.newThreadPerTaskExecutor(Thread.ofVirtual()
                .name("virtual-thread-", 0) // prefix + auto increment
                .factory());
    }
}
