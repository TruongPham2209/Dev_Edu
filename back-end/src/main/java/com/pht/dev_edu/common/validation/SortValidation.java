package com.pht.dev_edu.common.validation;

/**
 * Interface for verifying whether a requested sorting field / property name is valid.
 */
public interface SortValidation {

    /**
     * Checks if the given sorting field name is valid for the current query domain.
     *
     * @param sortBy the field name to sort by.
     * @return true if the sort field is allowed, false otherwise.
     */
    boolean isValid(String sortBy);
}
