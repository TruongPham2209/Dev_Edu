package com.pht.dev_edu.course.dto;

import com.pht.dev_edu.common.dto.AbstractPageRequest;
import com.pht.dev_edu.common.dto.ItemStatus;
import com.pht.dev_edu.common.validation.SortValidation;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.springframework.data.domain.Sort;
import org.springframework.util.StringUtils;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class CoursePageRequest extends AbstractPageRequest implements SortValidation {
    ItemStatus status;

    @Override
    public Sort[] toSort() {
        String sortBy = getSortBy();
        if (!StringUtils.hasText(sortBy)) {
            return new Sort[]{Sort.by(Sort.Direction.DESC, "created_at"), Sort.by(Sort.Direction.DESC, "id")};
        }

        if (!isValid(sortBy)) {
            throw new IllegalArgumentException("Invalid sortBy value: " + sortBy);
        }

        return new Sort[0];
    }

    @Override
    public boolean isValid(String sortBy) {
        return false;
    }
}
