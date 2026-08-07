package com.pht.dev_edu.notification.dto;

import com.pht.dev_edu.common.dto.AbstractCursorRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.springframework.data.domain.Sort;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class NotificationCursorRequest extends AbstractCursorRequest {

    @Override
    public Sort[] toSort() {
        return new Sort[0];
    }
}
