package com.pht.dev_edu.common.constant;

public class KafkaTopicConstant {
    public static final String KAFKA_CONSUMER_GROUP = "dev-edu-group";

    // File Topics
    public static final String FILE_DELETE_TOPIC = "file-delete-topic";
    public static final String VIDEO_DURATION_EVENT_TOPIC = "video-duration-event-topic";

    // Mail Topics
    public static final String MAIL_SEND_TOPIC = "mail-send-topic";

    // Tracking and Logging Topics
    public static final String REQUEST_LOG_TOPIC = "request-log-topic";
    public static final String TRACKING_EVENT_TOPIC = "tracking-event-topic";
    public static final String SUBMISSION_EVENT_TOPIC = "submission-event-topic";
    public static final String CRON_JOB_EVENT_TOPIC = "cron-job-event-topic";

    // Sync Elastic Topics
    public static final String POST_ELASTIC_DATA_UPDATE_TOPIC = "post-elastic-data-update-topic";
    public static final String POST_INTERACT_ELASTIC_DATA_UPDATE_TOPIC = "post-interactive-elastic-data-update-topic";
    public static final String POST_ELASTIC_DATA_DELETE_TOPIC = "post-elastic-data-delete-topic";

    // Quiz Logging Topics
    public static final String QUIZ_AUDIT_LOG_TOPIC = "quiz-audit-log-topic";
    public static final String QUIZ_AUTOSAVE_LOG_TOPIC = "quiz-autosave-log-topic";
}
