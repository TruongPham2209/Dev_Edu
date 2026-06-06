package com.pht.dev_edu.forum.document;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.IOException;
import java.time.Instant;
import java.util.UUID;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostDocument {
    private UUID id;

    private String title;

    private String shortDescription;

    private String content;

    private String authorUsername;

    private String authorFullName;

    private String authorAvatarUrl;

    private String thumbUrl;

    @JsonSerialize(using = InstantEpochSerializer.class)
    @JsonDeserialize(using = InstantEpochDeserializer.class)
    private Instant createdAt;

    @JsonSerialize(using = InstantEpochSerializer.class)
    @JsonDeserialize(using = InstantEpochDeserializer.class)
    private Instant updatedAt;

    /**
     * Statistics
     */
    private long viewCount;

    private long commentCount;

    private long saveCount;

    /**
     * Recommendation
     */
    private double popularityScore;

    /**
     * Search optimization
     */
    private String combinedText;

    /**
     * Dynamic score from Elasticsearch hit
     */
    private Double score;

    public static class InstantEpochSerializer extends JsonSerializer<Instant> {
        @Override
        public void serialize(Instant value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
            if (value != null) {
                gen.writeNumber(value.toEpochMilli());
            } else {
                gen.writeNull();
            }
        }
    }

    public static class InstantEpochDeserializer extends JsonDeserializer<Instant> {
        @Override
        public Instant deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
            try {
                long epochMilli = p.getValueAsLong();
                return Instant.ofEpochMilli(epochMilli);
            } catch (Exception e) {
                String text = p.getText();
                if (text != null && !text.trim().isEmpty()) {
                    return Instant.parse(text);
                }
                return null;
            }
        }
    }
}
