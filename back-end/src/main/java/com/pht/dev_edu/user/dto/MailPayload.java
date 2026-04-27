package com.pht.dev_edu.user.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MailPayload {
    String toMail;
    Subject subject;
    Template template;
    Map<String, Object> mailAttributes;
    Map<String, Object> fileAttributes;

    @Getter
    public enum Subject {
        WELCOME("Welcome to DevEdu!"),
        PASSWORD_RESET("Password Reset Request"),
        ACCOUNT_VERIFICATION("Account Verification Required");

        private final String value;

        Subject(String value) {
            this.value = value;
        }

    }

    @Getter
    public enum Template {
        WELCOME_TEMPLATE("welcome_template"),
        PASSWORD_RESET_TEMPLATE("password_reset_template"),
        ACCOUNT_VERIFICATION_TEMPLATE("account_verification_template");

        private final String value;

        Template(String value) {
            this.value = value;
        }

    }
}
