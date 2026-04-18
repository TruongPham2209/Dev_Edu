package com.pht.dev_edu.forum.dto;

import java.util.List;
import java.util.UUID;

public record UpdatePostVersionResult(
        List<UUID> affectedVersionIds,
        PostStatus newStatus,
        UUID currentVersionId
) {
}