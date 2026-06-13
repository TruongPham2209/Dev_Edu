package com.pht.dev_edu.common.dto;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.springframework.data.domain.Sort;

@Setter
@Getter
@SuperBuilder
@FieldDefaults(level = AccessLevel.PROTECTED)
public abstract class AbstractCursorRequest {
    String sortBy;
    Integer size = 10;
    String nextCursor;

    public AbstractCursorRequest() {
    }

    public abstract Sort[] toSort();
}
