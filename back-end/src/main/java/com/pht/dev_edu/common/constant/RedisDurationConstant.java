package com.pht.dev_edu.common.constant;

import java.time.Duration;

public class RedisDurationConstant {
    public static final Duration USER_DATA_DURATION = Duration.ofHours(1);
    public static final Duration ROLE_DATA_DURATION = Duration.ofHours(6);

    public static final Duration COURSE_DATA_DURATION = Duration.ofHours(2);
    public static final Duration CATEGORY_DATA_DURATION = Duration.ofHours(2);

    public static final Duration LECTURE_DATA_DURATION = Duration.ofHours(2);
    public static final Duration LECTURE_COMMENT_DATA_DURATION = Duration.ofHours(1);

    public static final Duration POST_DATA_DURATION = Duration.ofHours(1);
}
