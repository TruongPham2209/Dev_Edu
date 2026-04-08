package com.pht.dev_edu.common.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Arrays;

/**
 * Utility class for handling pagination.
 * Provides a method to create a Pageable object with validation and sorting.
 */
public class PagingUtil {
    /**
     * Creates a pageable object with the given page, page size, and optional sorting parameters.
     *
     * @param page     The requested page number (0-based). If negative, defaults to 0.
     * @param pageSize The requested page size. If invalid (<= 0 or > 50), defaults to 10.
     * @param sorts    Optional sorting criteria.
     * @return A {@link Pageable} instance with the given parameters.
     */
    public static Pageable getPageable(int page, int pageSize, Sort... sorts) {
        if (page < 0)
            page = 0;

        if (pageSize <= 0 || pageSize > 50)
            pageSize = 10;

        Sort sort = Sort.unsorted();
        if (sorts != null && sorts.length > 0) {
            sort = Arrays.stream(sorts)
                    .reduce(Sort::and)
                    .orElse(Sort.unsorted());
        }

        return PageRequest.of(page, pageSize, sort);
    }

    public static Pageable getPageable(int pageSize, Sort... sorts) {
        return getPageable(0, pageSize, sorts);
    }
}
