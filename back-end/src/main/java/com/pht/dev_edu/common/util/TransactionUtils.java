package com.pht.dev_edu.common.util;

import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.concurrent.Executor;

public class TransactionUtils {
    public static void runAfterCommitAsync(Runnable action, Executor executor) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            executor.execute(action);
                        }
                    }
            );
        } else {
            executor.execute(action);
        }
    }
}
