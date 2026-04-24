package com.pht.dev_edu.course.dto;

import com.pht.dev_edu.common.dto.AbstractPageRequest;
import com.pht.dev_edu.common.dto.ItemStatus;
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
public class CoursePageRequest extends AbstractPageRequest {
    ItemStatus status;

    @Override
    public Sort[] toSort() {
        String sortBy = getSortBy();
        if (!StringUtils.hasText(sortBy)) {
            return new Sort[]{Sort.by(Sort.Direction.DESC, "created_at", "id")};
        }

        return new Sort[0];
    }
}
