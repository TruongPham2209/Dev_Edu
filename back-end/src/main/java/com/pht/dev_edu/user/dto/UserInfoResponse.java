package com.pht.dev_edu.user.dto;

import com.pht.dev_edu.common.dto.RoleEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class UserInfoResponse {
    UUID id;

    String username;

    String email;

    String fullName;

    String avatarUrl;

    Integer courseCount; // enrolledCourses for user, assignedCourses for lecturer, admin is null

    Integer postedPosts;

    RoleEnum role;
}
