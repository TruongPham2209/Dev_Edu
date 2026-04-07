package com.pht.dev_edu.common.config;

import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Component
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class S3Config {
    @Value("${cloudflare.r2.endpoint}")
    String endpoint;

    @Value("${cloudflare.r2.access-key}")
    String accessKey;

    @Value("${cloudflare.r2.secret-key}")
    String secretKey;

    @Bean
    S3Presigner s3Presigner() {
        return S3Presigner.builder()
                .endpointOverride(java.net.URI.create(endpoint))
                .credentialsProvider(() -> software.amazon.awssdk.auth.credentials.AwsBasicCredentials.create(
                        accessKey,
                        secretKey
                ))
                .region(software.amazon.awssdk.regions.Region.US_EAST_1) // R2 uses a fixed region
                .build();
    }

    @Bean
    S3Client s3Client() {
        return S3Client.builder()
                .endpointOverride(java.net.URI.create(endpoint))
                .credentialsProvider(() -> software.amazon.awssdk.auth.credentials.AwsBasicCredentials.create(
                        accessKey,
                        secretKey
                ))
                .region(software.amazon.awssdk.regions.Region.US_EAST_1) // R2 uses a fixed region
                .build();
    }
}
