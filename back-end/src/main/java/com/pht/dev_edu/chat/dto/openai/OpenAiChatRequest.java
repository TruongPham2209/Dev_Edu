package com.pht.dev_edu.chat.dto.openai;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OpenAiChatRequest {
    String model;

    List<OpenAiMessage> messages;

    List<OpenAiTool> tools;

    @JsonProperty("max_tokens")
    Integer maxTokens;

    Double temperature;
}
