package com.pht.dev_edu.forum.dto;

public enum PostStatus {
    PENDING,
    SUPERSEDED, // When approved, the old version becomes superseded
    APPROVED,
    REJECTED
}
