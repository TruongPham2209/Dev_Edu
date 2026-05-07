package com.pht.dev_edu.forum.dto;

import com.pht.dev_edu.common.dto.AbstractPageRequest;
import com.pht.dev_edu.common.dto.ItemStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.springframework.data.domain.Sort;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class PostPageRequest extends AbstractPageRequest {
    ItemStatus status;

    @Override
    public Sort[] toSort() {
        return new Sort[0];
    }

    public enum SortMode {
        NEWEST, TRENDING, HIGHEST_RATED
    }
}
