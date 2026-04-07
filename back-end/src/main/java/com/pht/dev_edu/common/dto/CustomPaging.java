package com.pht.dev_edu.common.dto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Collection;
import java.util.Collections;
import java.util.function.Function;

public class CustomPaging<T> {
    private final Collection<T> contents;
    private final long totalPages;
    private final long currentPage;
    private long pageSize;
    private final long totalElements;

    public CustomPaging() {
        this.contents = Collections.emptyList();
        this.totalPages = 0;
        this.currentPage = 0;
        this.pageSize = 0;
        this.totalElements = 0;
    }

    public CustomPaging(Page<T> pages) {
        this.contents = pages.getContent();
        this.totalPages = pages.getTotalPages();
        this.currentPage = pages.getNumber();
        this.pageSize = pages.getSize();
        this.totalElements = pages.getTotalElements();
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
    }

    public <E> CustomPaging(Page<E> pages, Function<E, T> mapper) {
        this.contents = pages.getContent().stream().map(mapper).toList();
        this.totalPages = pages.getTotalPages();
        this.currentPage = pages.getNumber();
        this.pageSize = pages.getSize();
        this.totalElements = pages.getTotalElements();
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
}
