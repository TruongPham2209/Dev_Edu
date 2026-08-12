package com.pht.dev_edu.notification.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class RegisterDeviceTokenRequest {
    @NotBlank(message = "fcmToken must not be blank")
    String fcmToken;

    String deviceType;
}
