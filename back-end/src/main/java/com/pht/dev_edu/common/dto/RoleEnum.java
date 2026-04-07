package com.pht.dev_edu.common.dto;

public enum RoleEnum {
    ADMIN("Admin"),
    LECTURER("Lecturer"),
    STUDENT("Student");

    private final String displayName;

    RoleEnum(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
