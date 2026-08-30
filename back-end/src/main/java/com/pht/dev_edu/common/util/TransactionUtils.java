package com.pht.dev_edu.common.util;

import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.concurrent.Executor;

/**
 * Utility class for synchronizing post-commit asynchronous tasks with Spring active transactions.
 */
public class TransactionUtils {

    /**
     * Executes the given runnable asynchronously using the provided executor after the active database transaction commits.
     * If no transaction is active, executes the action immediately on the executor.
     *
     * @param action   the task to run.
     * @param executor the {@link Executor} to run the task on.
     */
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
