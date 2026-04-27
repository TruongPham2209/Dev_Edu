package com.pht.dev_edu.common.dto;

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
    String subject;
    String template;
    Map<String, Object> mailAttributes;
    Map<String, Object> fileAttributes;
}