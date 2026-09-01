package com.pht.dev_edu.common.constant;

public class RedisPrefixConstant {
    public static final String REGISTERED_CLIENT_ID = "dev_edu:clients:id:";
    public static final String REGISTERED_CLIENT_CLIENT_ID = "dev_edu:clients:client_id:";

    public static final String USER_USERNAME_PREFIX = "dev_edu:users:username:"; // Prefix for user data by username
    public static final String USER_EMAIL_PREFIX = "dev_edu:users:email:"; // Prefix for user data by email

    public static final String ROLE_PREFIX = "dev_edu:roles:"; // Prefix for role data

    public static final String CATEGORY_PREFIX = "dev_edu:categories:"; // Prefix for category data
    public static final String COURSE_PREFIX = "dev_edu:courses:"; // Prefix for course data
    public static final String COURSE_HIGHLIGHTED = "dev_edu:courses:highlighted"; // Key for highlighted courses

    public static final String LECTURE_PREFIX = "dev_edu:lectures:"; // Prefix for lecture data
    public static final String LECTURE_COMMENT_PREFIX = "dev_edu:lecture_comments:"; // Prefix for lecture comment data
    public static final String LECTURE_PROGRESS_PREFIX = "dev_edu:lecture_progress:"; // Prefix for lecture progress data

    public static final String POST_PREFIX = "dev_edu:posts:"; // Prefix for post data

    public static final String QUIZ_PREFIX = "dev_edu:quizzes:"; // Prefix for quiz data
    public static final String QUIZ_DETAIL_PREFIX = "dev_edu:quizzes:detail:";
    public static final String QUIZ_ASSIGNMENT_PREFIX = "dev_edu:quizzes:assignments:"; // Prefix for quiz assignment data

    public static final String NOTIFICATION_PREFIX = "dev_edu:notifications:";
    public static final String FILE_MULTIPART_SESSION_PREFIX = "dev_edu:file:multipart:session:";
}
