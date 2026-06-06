package com.pht.dev_edu.forum.dto;

import com.pht.dev_edu.forum.document.PostDocument;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Getter
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class PostDocumentWithScore {
    PostDocument doc;
    double score;
}
