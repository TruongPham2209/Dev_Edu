package com.pht.dev_edu.forum.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.forum.document.PostDocument;
import com.pht.dev_edu.forum.dto.PostDocumentWithScore;
import com.pht.dev_edu.forum.dto.PostResponse;
import com.pht.dev_edu.forum.dto.PostStatus;
import com.pht.dev_edu.forum.repo.PostElasticsearchRepository;
import com.pht.dev_edu.forum.repo.SearchResult;
import com.pht.dev_edu.forum.repo.UserInteractionRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class SearchPostServiceImpl implements SearchPostService {
    PostElasticsearchRepository postElasticsearchRepository;
    UserInteractionRepository userInteractionRepository;

    private List<UUID> getUserInteractedPostIds(String username) {
        if (!StringUtils.hasText(username)) {
            return Collections.emptyList();
        }
        try {
            String cacheKey = "user_interactions:" + username;
            List<?> cachedList = com.pht.dev_edu.common.util.RedisUtils.getDataFromCacheOrDb(
                    cacheKey,
                    List.class,
                    () -> userInteractionRepository.getUserInteractedPostIdsWeighted(username, 100),
                    java.time.Duration.ofHours(2)
            );
            if (cachedList != null) {
                List<UUID> ids = new ArrayList<>();
                for (Object obj : cachedList) {
                    if (obj != null) {
                        ids.add(UUID.fromString(obj.toString()));
                    }
                }
                return ids;
            }
        } catch (Exception e) {
            log.error("Failed to fetch user interaction profile for {}", username, e);
        }
        return Collections.emptyList();
    }

    @Override
    public CustomPaging<PostResponse> getPostsInFeed(String username, String nextCursor) {
        int offset = decodeCursor(nextCursor);
        int limit = 10; // requested page size

        List<UUID> interactedPostIds = getUserInteractedPostIds(username);

        SearchResult searchResult = postElasticsearchRepository.getFeed(interactedPostIds, offset, limit + 1);
        List<PostResponse> responses = new ArrayList<>();
        for (PostDocument doc : searchResult.getDocuments()) {
            responses.add(mapToResponse(doc, username));
        }

        return createCustomPaging(responses, offset, limit, searchResult.getTotalHits());
    }

    @Override
    public CustomPaging<PostResponse> searchPosts(String username, String keyword, String nextCursor) {
        if (!StringUtils.hasText(keyword)) {
            return new CustomPaging<>();
        }

        int offset = decodeCursor(nextCursor);
        int limit = 10; // requested page size

        List<UUID> interactedPostIds = getUserInteractedPostIds(username);

        SearchResult searchResult = postElasticsearchRepository.search(keyword, interactedPostIds, offset, limit + 1);
        List<PostResponse> responses = new ArrayList<>();
        for (PostDocument doc : searchResult.getDocuments()) {
            responses.add(mapToResponse(doc, username));
        }

        return createCustomPaging(responses, offset, limit, searchResult.getTotalHits());
    }

    @Override
    public List<PostResponse> getRelatedPosts(UUID postId) {
        if (postId == null) {
            return Collections.emptyList();
        }

        // 1. Fetch Save Co-occurrence counts from DB
        Map<UUID, Double> coOccurrenceMap = new HashMap<>();
        try {
            List<Object[]> coOccurrences = userInteractionRepository.getSaveCoOccurrence(postId, 50);
            if (coOccurrences != null) {
                for (Object[] row : coOccurrences) {
                    if (row != null && row.length >= 2) {
                        UUID otherPostId = null;
                        if (row[0] instanceof UUID) {
                            otherPostId = (UUID) row[0];
                        } else if (row[0] instanceof String) {
                            otherPostId = UUID.fromString((String) row[0]);
                        }

                        Double count = null;
                        if (row[1] instanceof Number) {
                            count = ((Number) row[1]).doubleValue();
                        }

                        if (otherPostId != null && count != null) {
                            coOccurrenceMap.put(otherPostId, count);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch save co-occurrence for post {}", postId, e);
        }

        // 2. Query Elasticsearch for related posts based on More Like This + Popularity
        SearchResult relatedResult = postElasticsearchRepository.getRelated(postId, 50);
        List<PostDocument> documents = new ArrayList<>(relatedResult.getDocuments());

        // 3. Merge ES score with Save Co-occurrence in Java
        // final_score = esScore + coOccurrenceCount * 2.0
        List<PostDocumentWithScore> candidates = new ArrayList<>();
        Map<UUID, PostDocumentWithScore> candidateMap = new HashMap<>();

        for (PostDocument doc : documents) {
            if (doc.getId().equals(postId)) {
                continue; // Skip current post
            }
            double esScore = doc.getScore() != null ? doc.getScore() : 0.0;
            double coOccurrenceCount = coOccurrenceMap.getOrDefault(doc.getId(), 0.0);
            double finalScore = esScore + coOccurrenceCount * 2.0;
            PostDocumentWithScore candidate = new PostDocumentWithScore(doc, finalScore);
            candidates.add(candidate);
            candidateMap.put(doc.getId(), candidate);
        }

        // 4. Fallback Strategy: If we have less than 5 unique related posts, get global recommendations
        if (candidates.size() < 5) {
            try {
                SearchResult globalResult = postElasticsearchRepository.getGlobalRecommendations(50);
                for (PostDocument doc : globalResult.getDocuments()) {
                    if (doc.getId().equals(postId)) {
                        continue; // Skip current post
                    }
                    if (!candidateMap.containsKey(doc.getId())) {
                        double finalScore = doc.getScore() != null ? doc.getScore() : 0.0;
                        PostDocumentWithScore candidate = new PostDocumentWithScore(doc, finalScore);
                        candidates.add(candidate);
                        candidateMap.put(doc.getId(), candidate);
                    }
                }
            } catch (Exception e) {
                log.error("Failed to fetch global recommendations for fallback", e);
            }
        }

        // Sort by final score descending
        candidates.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));

        // 5. Map to PostResponse and limit to 10 results
        List<PostResponse> responses = new ArrayList<>();
        int count = 0;
        for (PostDocumentWithScore item : candidates) {
            if (count >= 10) break;
            responses.add(mapToResponse(item.getDoc(), null));
            count++;
        }

        return responses;
    }

    private PostResponse mapToResponse(PostDocument doc, String currentUsername) {
        if (doc == null) return null;
        return PostResponse.builder()
                .id(doc.getId())
                .title(doc.getTitle())
                .shortDescription(doc.getShortDescription())
                .content(doc.getContent())
                .thumbUrl(doc.getThumbUrl())
                .status(PostStatus.APPROVED) // All indexed posts are APPROVED
                .createdAt(doc.getCreatedAt() != null ? LocalDateTime.ofInstant(doc.getCreatedAt(), ZoneId.systemDefault()) : null)
                .updatedAt(doc.getUpdatedAt() != null ? LocalDateTime.ofInstant(doc.getUpdatedAt(), ZoneId.systemDefault()) : null)
                .authorUsername(doc.getAuthorUsername())
                .authorFullName(doc.getAuthorFullName())
                .authorAvatarUrl(doc.getAuthorAvatarUrl())
                .isMine(currentUsername != null && currentUsername.equals(doc.getAuthorUsername()))
                .views((int) doc.getViewCount())
                .comments((int) doc.getCommentCount())
                .build();
    }

    private int decodeCursor(String cursor) {
        if (!StringUtils.hasText(cursor)) {
            return 0;
        }
        try {
            byte[] decodedBytes = Base64.getUrlDecoder().decode(cursor);
            String decodedStr = new String(decodedBytes, StandardCharsets.UTF_8);
            return Integer.parseInt(decodedStr);
        } catch (Exception e) {
            log.warn("Failed to decode cursor: {}, defaulting to 0", cursor, e);
            return 0;
        }
    }

    private String encodeCursor(int offset) {
        return Base64.getUrlEncoder().encodeToString(String.valueOf(offset).getBytes(StandardCharsets.UTF_8));
    }

    private CustomPaging<PostResponse> createCustomPaging(List<PostResponse> contents, int offset, int limit, long totalElements) {
        CustomPaging<PostResponse> paging = new CustomPaging<>();
        paging.setPageSize(limit);
        paging.setCurrentPage(offset / limit);
        paging.setTotalElements(totalElements);
        paging.setTotalPages((long) Math.ceil((double) totalElements / limit));

        if (contents.size() > limit) {
            paging.setContents(contents.subList(0, limit));
            paging.setNextCursor(encodeCursor(offset + limit));
        } else {
            paging.setContents(contents);
            paging.setNextCursor(null);
        }

        return paging;
    }
}
