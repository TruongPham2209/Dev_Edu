package com.pht.dev_edu.common.dto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.function.Function;

public class CustomPaging<T> {
    private final Collection<T> contents;
    private final long totalPages;
    private long currentPage;
    private long pageSize;
    private final long totalElements;
    private final T lastItem;

    public CustomPaging() {
        this.contents = Collections.emptyList();
        this.totalPages = 0;
        this.currentPage = 0;
        this.pageSize = 0;
        this.totalElements = 0;
        this.lastItem = null;
    }

    public CustomPaging(Page<T> pages) {
        this.contents = pages.getContent();
        this.totalPages = pages.getTotalPages();
        this.currentPage = pages.getNumber();
        this.pageSize = pages.getSize();
        this.totalElements = pages.getTotalElements();
        this.lastItem = getLast();
    }

    public <E> CustomPaging(Collection<E> contents, Function<E, T> mapper, Pageable pageable) {
        this.pageSize = pageable.getPageSize();
        this.currentPage = pageable.getPageNumber();
        this.contents = contents.stream()
                .skip(pageSize * currentPage)
                .limit(pageSize)
                .map(mapper)
                .toList();
        this.totalPages = (long) Math.ceil((double) contents.size() / pageSize);
        this.totalElements = contents.size();
        this.lastItem = getLast();
    }

    public <E> CustomPaging(Page<E> pages, Function<E, T> mapper) {
        this.contents = pages.getContent().stream().map(mapper).toList();
        this.totalPages = pages.getTotalPages();
        this.currentPage = pages.getNumber();
        this.pageSize = pages.getSize();
        this.totalElements = pages.getTotalElements();
        this.lastItem = getLast();
    }

    @Override
    public String toString() {
        return "CustomPaging [contents=" + contents + ", totalPages=" + totalPages + ", currentPage=" + currentPage
                + ", pageSize=" + pageSize + "]";
    }

    public void addAll(Collection<T> contents) {
        this.contents.addAll(contents);
        this.pageSize = this.contents.size();
    }

    public Collection<T> getContents() {
        return contents;
    }

    public long getTotalPages() {
        return totalPages;
    }

    public long getCurrentPage() {
        return currentPage;
    }

    public long getPageSize() {
        return pageSize;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setCurrentPage(long currentPage) {
        this.currentPage = currentPage;
    }

    private T getLast() {
        if (contents == null || contents.isEmpty()) {
            return null;
        }

        if (contents instanceof List<T> list) {
            return list.getLast();
        }

        // fallback cho Collection khác
        T last = null;
        for (T item : contents) {
            last = item;
        }
        return last;
    }
}
