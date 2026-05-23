package com.pht.dev_edu.user.dto;

import java.util.UUID;

/**
 * Projection for {@link com.pht.dev_edu.user.entity.UserEntity}
 */
public record UserInfoProjection(
        UUID id,

        String username,

        String fullName,

        String avatarUrl,

        String email,

        Integer courseCount,

        Integer postedPosts
) {

}