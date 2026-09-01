package com.pht.dev_edu.file.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.convert.DurationUnit;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.time.temporal.ChronoUnit;

/**
 * Configuration properties for chunked / multipart file uploads.
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "file.upload.multipart")
public class FileMultipartProperties {

    /**
     * Default chunk size in bytes (default: 10MB).
     * S3 / Cloudflare R2 requires part size >= 5MB for non-last parts.
     */
    private long chunkSize = 10 * 1024 * 1024L;

    /**
     * Number of part presigned URLs to generate in a single batch window (default: 20).
     */
    private int presignWindowSize = 20;

    /**
     * Recommended frontend upload concurrency (default: 5).
     */
    private int uploadConcurrency = 5;

    /**
     * Expiration duration for individual presigned part URLs (default: 30 minutes).
     */
    @DurationUnit(ChronoUnit.MINUTES)
    private Duration presignExpiration = Duration.ofMinutes(30);

    /**
     * Expiration duration for the entire multipart upload session (default: 3 hours).
     */
    @DurationUnit(ChronoUnit.HOURS)
    private Duration sessionExpiration = Duration.ofHours(3);
}
