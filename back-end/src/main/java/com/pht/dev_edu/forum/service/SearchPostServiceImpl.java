package com.pht.dev_edu.forum.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.forum.dto.PostResponse;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class SearchPostServiceImpl implements SearchPostService {
    //    Related post score: score = tag_similarity * 0.4 + text_similarity * 0.3 + save_cooccurrence * 0.3 => Dùng elastic search để tính toán điểm số này, sau đó sắp xếp và trả về kết quả
    // TODO: search posts in feed, search posts by keyword, get related posts using Elasticsearch

    @Override
    public CustomPaging<PostResponse> getPostsInFeed(String username, String nextCursor) {
        return null;
    }

    @Override
    public CustomPaging<PostResponse> searchPosts(String username, String keyword, String nextCursor) {
        return null;
    }

    @Override
    public List<PostResponse> getRelatedPosts(UUID postId) {
        return List.of();
    }
}
