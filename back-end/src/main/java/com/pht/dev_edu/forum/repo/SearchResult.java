package com.pht.dev_edu.forum.repo;

import com.pht.dev_edu.forum.document.PostDocument;
import lombok.Value;

import java.util.List;

@Value
public class SearchResult {
    List<PostDocument> documents;
    long totalHits;
}
