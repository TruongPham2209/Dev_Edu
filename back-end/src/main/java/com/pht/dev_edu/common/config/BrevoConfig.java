package com.pht.dev_edu.common.config;

import brevo.ApiClient;
import brevo.auth.ApiKeyAuth;
import brevoApi.TransactionalEmailsApi;
import brevoModel.SendSmtpEmailSender;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class BrevoConfig {
    @Value("${brevo.api-key}")
    String apiKey;

    @Value("${brevo.from-mail}")
    String fromMail;

    @Value("${brevo.from-name}")
    String fromName;

    @Value("${brevo.api-url}")
    String apiUrl;

    @Bean
    SendSmtpEmailSender brevoSender() {
        return new SendSmtpEmailSender()
                .email(fromMail)
                .name(fromName);
    }

    @Bean
    ApiClient brevoApiClient() {
        ApiClient apiClient = new ApiClient();
        apiClient.setBasePath(apiUrl);

        ApiKeyAuth apiKeyAuth = (ApiKeyAuth) apiClient.getAuthentication("api-key");
        apiKeyAuth.setApiKey(apiKey);

        return apiClient;
    }

    @Bean
    TransactionalEmailsApi transactionalEmailsApi(ApiClient apiClient) {
        return new TransactionalEmailsApi(apiClient);
    }
}
