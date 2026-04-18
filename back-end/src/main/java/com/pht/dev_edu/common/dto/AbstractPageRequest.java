package com.pht.dev_edu.common.dto;

import com.pht.dev_edu.common.util.PagingUtil;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.util.StringUtils;

@Setter
@Getter
@SuperBuilder
@FieldDefaults(level = AccessLevel.PROTECTED)
public abstract class AbstractPageRequest {
    String sortBy;
    Integer page = 0;
    Integer size = 10;
    String nextCursor;

    public final Pageable toPageable() {
        if (!StringUtils.hasText(nextCursor)) {
            return PagingUtil.getPageable(size, toSort());
        }

        return PagingUtil.getPageable(page, size, toSort());
    }

    public abstract Sort[] toSort();

    public final void setDefaultPage() {
        this.page = 0;
        this.size = 10;
    }
}
