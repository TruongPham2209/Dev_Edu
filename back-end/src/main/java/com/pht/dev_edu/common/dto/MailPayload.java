package com.pht.dev_edu.common.dto;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.Map;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MailPayload {
    String toMail;
    String subject;
    String template;
    Map<String, Object> mailAttributes;
    Map<String, Object> fileAttributes;
}