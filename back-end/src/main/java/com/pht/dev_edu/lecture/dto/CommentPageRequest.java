package com.pht.dev_edu.lecture.dto;

import com.pht.dev_edu.common.dto.AbstractPageRequest;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.springframework.data.domain.Sort;

import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class CommentPageRequest extends AbstractPageRequest {
    @NotNull(message = "Lecture id must not be null")
    UUID lectureId;

    UUID parentCommentId; // nullable, if null means get root comments

    @Override
    public Sort[] toSort() {
        Sort sortBy = Sort.by(Sort.Direction.DESC, "created_at").and(Sort.by(Sort.Direction.DESC, "id"));
        return new Sort[]{sortBy};
    }
}
