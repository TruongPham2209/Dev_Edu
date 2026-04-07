package com.pht.dev_edu.common.config;

import org.springframework.context.annotation.Configuration;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

@Configuration
public class AsyncConfig {
    Executor taskExecutor() {
        return Executors.newThreadPerTaskExecutor(Thread.ofVirtual()
                .name("virtual-thread-", 0) // prefix + auto increment
                .factory()
        );
    }
}
