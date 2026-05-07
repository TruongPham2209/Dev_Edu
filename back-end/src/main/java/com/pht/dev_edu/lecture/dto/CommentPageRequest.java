package com.pht.dev_edu.lecture.dto;

import com.pht.dev_edu.common.dto.AbstractPageRequest;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.springframework.data.domain.Sort;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class CommentPageRequest extends AbstractPageRequest {
    @NotNull(message = "Lecture id must not be null")
    UUID lectureId;

    UUID parentCommentId; // nullable, if null means get root comments

    @Override
    public Sort[] toSort() {
        return new Sort[]{};
    }
}
