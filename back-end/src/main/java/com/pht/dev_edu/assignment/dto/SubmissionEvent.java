package com.pht.dev_edu.assignment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class SubmissionEvent {
    UUID assignmentId;
    String fullObjectKey;
    String username;
    Action action;

    @Builder.Default
    LocalDateTime timestamp = LocalDateTime.now();

    public static enum Action {
        SUBMITTED, UNSUBMITTED
    }
}
