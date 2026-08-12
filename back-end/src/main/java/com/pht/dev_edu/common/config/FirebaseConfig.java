package com.pht.dev_edu.common.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;

@Slf4j
@Configuration
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class FirebaseConfig {

    @Value("${firebase.service-account-path:src/main/resources/keys/firebase-service-account.json}")
    String serviceAccountPath;

    @Bean
    FirebaseMessaging firebaseMessaging() {
        try {
            File serviceAccountFile = new File(serviceAccountPath);
            InputStream serviceAccountStream = null;

            if (serviceAccountFile.exists()) {
                serviceAccountStream = new FileInputStream(serviceAccountFile);
            } else {
                // Check classpath or relative classpath fallback
                String cleanPath = serviceAccountPath.replace("classpath:", "");
                if (cleanPath.startsWith("src/main/resources/")) {
                    cleanPath = cleanPath.substring("src/main/resources/".length());
                }
                InputStream resourceStream = getClass().getClassLoader().getResourceAsStream(cleanPath);
                if (resourceStream != null) {
                    serviceAccountStream = resourceStream;
                } else {
                    log.warn(
                            "Firebase service account file not found at '{}'. Push notification via FCM will be disabled.",
                            serviceAccountPath);
                    return null;
                }
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccountStream))
                    .build();

            FirebaseApp app = FirebaseApp.getApps().isEmpty()
                    ? FirebaseApp.initializeApp(options)
                    : FirebaseApp.getInstance();

            log.info("Firebase Admin SDK initialized successfully.");
            return FirebaseMessaging.getInstance(app);
        } catch (Exception e) {
            log.error("Failed to initialize Firebase Admin SDK: {}", e.getMessage(), e);
            return null;
        }
    }
}
