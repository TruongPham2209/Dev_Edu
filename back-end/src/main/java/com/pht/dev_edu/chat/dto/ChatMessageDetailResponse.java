package com.pht.dev_edu.chat.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageDetailResponse {
    UUID id;
    String role;
    String content;
    List<UUID> referencedCourseIds;
    List<CourseCardResponse> courses;
    LocalDateTime createdAt;
}
