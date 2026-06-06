package com.pht.dev_edu.forum.repo.impl;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.query_dsl.FunctionBoostMode;
import co.elastic.clients.elasticsearch._types.query_dsl.Like;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch.core.BulkRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import co.elastic.clients.json.JsonData;
import com.pht.dev_edu.common.constant.ElasticIndexConstant;
import com.pht.dev_edu.forum.document.PostDocument;
import com.pht.dev_edu.forum.repo.PostElasticsearchRepository;
import com.pht.dev_edu.forum.repo.SearchResult;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Slf4j
@Repository
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class PostElasticsearchRepositoryImpl implements PostElasticsearchRepository {
    ElasticsearchClient elasticsearchClient;
    NamedParameterJdbcTemplate jdbcTemplate;

    RowMapper<PostDocument> postDocumentRowMapper = (rs, rowNum) -> {
        UUID id = UUID.fromString(rs.getString("id"));
        String title = rs.getString("title");
        String shortDescription = rs.getString("shortDescription");
        String content = rs.getString("content");
        String authorUsername = rs.getString("authorUsername");
        String authorFullName = rs.getString("authorFullName");
        String authorAvatarUrl = rs.getString("authorAvatarUrl");
        String thumbUrl = rs.getString("thumbUrl");

        java.sql.Timestamp createdAtTs = rs.getTimestamp("createdAt");
        Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();
        java.sql.Timestamp updatedAtTs = rs.getTimestamp("updatedAt");
        Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : Instant.now();

        long viewCount = rs.getLong("viewCount");
        long commentCount = rs.getLong("commentCount");
        long saveCount = rs.getLong("saveCount");

        double popularityScore = Math.log(viewCount + 1.0) + commentCount * 2.0 + saveCount * 3.0;
        String combinedText = String.format("%s %s %s", title, shortDescription, content);

        return PostDocument.builder()
                .id(id)
                .title(title)
                .shortDescription(shortDescription)
                .content(content)
                .authorUsername(authorUsername)
                .authorFullName(authorFullName)
                .authorAvatarUrl(authorAvatarUrl)
                .thumbUrl(thumbUrl)
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .viewCount(viewCount)
                .commentCount(commentCount)
                .saveCount(saveCount)
                .popularityScore(popularityScore)
                .combinedText(combinedText)
                .build();
    };

    @Override
    public void syncAllToElasticsearch() {
        createIndexIfNotExists();
        try {
            // Post already synced to Elasticsearch, skip synchronization
            long count = elasticsearchClient.count(c -> c.index(ElasticIndexConstant.POST)).count();
            if (count > 0) {
                log.info("Posts already synced to Elasticsearch, skipping synchronization. Count: {}", count);
                return;
            }

            String sql = """
                    SELECT  p.id                        AS id,
                            pv.title                    AS title,
                            pv.short_description        AS shortDescription,
                            pv.content                  AS content,
                            p.author                    AS authorUsername,
                            u.full_name                 AS authorFullName,
                            u.avatar_url                AS authorAvatarUrl,
                            pv.thumb_url                AS thumbUrl,
                            p.created_at                AS createdAt,
                            p.updated_at                AS updatedAt,
                            (
                                SELECT COUNT(*)
                                FROM log_tracking lt
                                WHERE lt.aggregate_id = p.id
                                  AND (lt.action = 'post.view' OR lt.action = 'post_view')
                            )                           AS viewCount,
                            (
                                SELECT COUNT(*)
                                FROM forum_comment fc
                                WHERE fc.post_id = p.id
                                  AND fc.deleted_at IS NULL
                            )                           AS commentCount,
                            (
                                SELECT COUNT(*)
                                FROM saved_post sp
                                WHERE sp.post_id = p.id
                            )                           AS saveCount
                    FROM forum_post p
                    JOIN forum_post_version pv
                      ON p.current_version_id = pv.id
                    LEFT JOIN "user" u
                      ON p.author = u.username
                    WHERE p.deleted_at IS NULL
                    """;

            List<PostDocument> documents = jdbcTemplate.query(sql, new MapSqlParameterSource(), postDocumentRowMapper);
            if (documents.isEmpty()) {
                log.info("No posts to sync to Elasticsearch");
                return;
            }

            BulkRequest.Builder br = new BulkRequest.Builder();
            for (PostDocument doc : documents) {
                br.operations(op -> op
                        .index(idx -> idx
                                .index(ElasticIndexConstant.POST)
                                .id(doc.getId().toString())
                                .document(doc)
                        )
                );
            }

            var response = elasticsearchClient.bulk(br.build());
            if (response.errors()) {
                log.error("Bulk indexing completed with errors");
            } else {
                log.info("Successfully synchronized {} posts to Elasticsearch", documents.size());
            }
        } catch (Exception e) {
            log.error("Failed to synchronize posts to Elasticsearch", e);
        }
    }

    private void createIndexIfNotExists() {
        try {
            boolean exists = elasticsearchClient.indices().exists(e -> e.index(ElasticIndexConstant.POST)).value();
            if (!exists) {
                elasticsearchClient.indices().create(c -> c
                        .index(ElasticIndexConstant.POST)
                        .mappings(m -> m
                                .properties("id", p -> p.keyword(k -> k))
                                .properties("title", p -> p.text(t -> t.analyzer("standard")))
                                .properties("shortDescription", p -> p.text(t -> t.analyzer("standard")))
                                .properties("content", p -> p.text(t -> t.analyzer("standard")))
                                .properties("combinedText", p -> p.text(t -> t.analyzer("standard")))
                                .properties("authorUsername", p -> p.keyword(k -> k))
                                .properties("authorFullName", p -> p.text(t -> t.analyzer("standard")))
                                .properties("authorAvatarUrl", p -> p.keyword(k -> k))
                                .properties("thumbUrl", p -> p.keyword(k -> k))
                                .properties("createdAt", p -> p.date(d -> d))
                                .properties("updatedAt", p -> p.date(d -> d))
                                .properties("viewCount", p -> p.long_(l -> l))
                                .properties("commentCount", p -> p.long_(l -> l))
                                .properties("saveCount", p -> p.long_(l -> l))
                                .properties("popularityScore", p -> p.double_(d -> d))
                        )
                );
                log.info("Successfully created Elasticsearch index: {}", ElasticIndexConstant.POST);
            }
        } catch (Exception e) {
            log.error("Failed to check or create Elasticsearch index", e);
        }
    }

    @Override
    public SearchResult search(String keyword, List<UUID> userInteractedPostIds, int offset, int limit) {
        try {
            // Base search query using multi_match
            Query multiMatchQuery = new Query.Builder()
                    .multiMatch(mm -> mm
                            .query(keyword)
                            .fields(List.of("title^3", "shortDescription^2", "content"))
                    ).build();

            Query finalQuery;

            // Logged In Search: combine keyword search with user interest profile boost using should MLT
            if (userInteractedPostIds != null && !userInteractedPostIds.isEmpty()) {
                List<Like> likes = userInteractedPostIds.stream()
                        .map(id -> Like.of(l -> l.document(d -> d.index(ElasticIndexConstant.POST).id(id.toString()))))
                        .toList();

                Query mltQuery = new Query.Builder()
                        .moreLikeThis(mlt -> mlt
                                .fields(List.of("title", "shortDescription", "content"))
                                .like(likes)
                                .minTermFreq(1)
                                .maxQueryTerms(25)
                        ).build();

                finalQuery = new Query.Builder()
                        .bool(b -> b
                                .must(multiMatchQuery)
                                .should(mltQuery)
                        ).build();
            } else {
                // Anonymous Search
                finalQuery = multiMatchQuery;
            }

            SearchResponse<PostDocument> response = elasticsearchClient.search(s -> s
                            .index(ElasticIndexConstant.POST)
                            .query(finalQuery)
                            .from(offset)
                            .size(limit)
                    , PostDocument.class
            );

            return mapSearchResponse(response);
        } catch (Exception e) {
            log.error("Elasticsearch search query failed", e);
            return new SearchResult(Collections.emptyList(), 0);
        }
    }

    @Override
    public SearchResult getFeed(List<UUID> userInteractedPostIds, int offset, int limit) {
        try {
            Query finalQuery;

            if (userInteractedPostIds != null && !userInteractedPostIds.isEmpty()) {
                // Logged In Personalized Feed
                List<Like> likes = userInteractedPostIds.stream()
                        .map(id -> Like.of(l -> l.document(d -> d.index(ElasticIndexConstant.POST).id(id.toString()))))
                        .toList();

                Query mltQuery = new Query.Builder()
                        .moreLikeThis(mlt -> mlt
                                .fields(List.of("title", "shortDescription", "content"))
                                .like(likes)
                                .minTermFreq(1)
                                .maxQueryTerms(25)
                        ).build();

                // Hybrid Query: match all eligible posts, and apply interest matching as a should boost
                Query boolQuery = new Query.Builder()
                        .bool(b -> b
                                .must(q -> q.matchAll(m -> m))
                                .should(mltQuery)
                        ).build();

                finalQuery = new Query.Builder()
                        .functionScore(fs -> fs
                                .query(boolQuery)
                                .functions(f -> f.scriptScore(ss -> ss.script(s -> s.inline(in -> in
                                        .source("double popularityScore = Math.log(doc['viewCount'].value + 1.0) + doc['commentCount'].value * 2.0 + doc['saveCount'].value * 3.0; " +
                                                "double diffDays = (params.now - doc['createdAt'].value.toInstant().toEpochMilli()) / 86400000.0; " +
                                                "if (diffDays < 0.0) diffDays = 0.0; " +
                                                "double freshnessScore = 1.0 / (1.0 + diffDays); " +
                                                "double interestScore = _score - 1.0; " + // Subtract 1.0 since match_all awards 1.0 baseline score
                                                "if (interestScore < 0.0) interestScore = 0.0; " +
                                                "double score = interestScore * 0.5 + popularityScore * 0.3 + freshnessScore * 0.2; " +
                                                "if (params.interactedIds != null && params.interactedIds.contains(doc['id'].value)) { return score * 0.0001; } " + // Re-rank already read posts to the bottom instead of filtering
                                                "return score;")
                                        .params("now", JsonData.of(System.currentTimeMillis()))
                                        .params("interactedIds", JsonData.of(userInteractedPostIds.stream().map(UUID::toString).toList()))
                                ))))
                                .boostMode(FunctionBoostMode.Replace)
                        ).build();
            } else {
                // Anonymous Feed (Popularity + Freshness decay script)
                finalQuery = new Query.Builder()
                        .functionScore(fs -> fs
                                .query(q -> q.matchAll(m -> m))
                                .functions(f -> f.scriptScore(ss -> ss.script(s -> s.inline(in -> in
                                        .source("double popularityScore = Math.log(doc['viewCount'].value + 1.0) + doc['commentCount'].value * 2.0 + doc['saveCount'].value * 3.0; " +
                                                "double diffDays = (params.now - doc['createdAt'].value.toInstant().toEpochMilli()) / 86400000.0; " +
                                                "if (diffDays < 0.0) diffDays = 0.0; " +
                                                "double freshnessScore = 1.0 / (1.0 + diffDays); " +
                                                "return popularityScore * 0.6 + freshnessScore * 0.4;")
                                        .params("now", JsonData.of(System.currentTimeMillis()))
                                ))))
                                .boostMode(FunctionBoostMode.Replace)
                        ).build();
            }

            SearchResponse<PostDocument> response = elasticsearchClient.search(s -> s
                            .index(ElasticIndexConstant.POST)
                            .query(finalQuery)
                            .from(offset)
                            .size(limit)
                    , PostDocument.class
            );

            return mapSearchResponse(response);
        } catch (Exception e) {
            log.error("Elasticsearch feed query failed", e);
            return new SearchResult(Collections.emptyList(), 0);
        }
    }

    @Override
    public SearchResult getRelated(UUID postId, int limit) {
        try {
            // Text Similarity via More Like This
            Query mltQuery = new Query.Builder()
                    .moreLikeThis(mlt -> mlt
                            .fields(List.of("title", "shortDescription", "content"))
                            .like(Like.of(l -> l.document(d -> d.index(ElasticIndexConstant.POST).id(postId.toString()))))
                            .minTermFreq(1)
                            .maxQueryTerms(25)
                    ).build();

            // Exclude the source post from related posts
            Query query = new Query.Builder()
                    .bool(b -> b
                            .must(mltQuery)
                            .mustNot(mn -> mn.ids(ids -> ids.values(List.of(postId.toString()))))
                    ).build();

            // Wrap in function score for Popularity addition
            Query finalQuery = new Query.Builder()
                    .functionScore(fs -> fs
                            .query(query)
                            .functions(f -> f.scriptScore(ss -> ss.script(s -> s.inline(in -> in
                                    .source("double popularityScore = Math.log(doc['viewCount'].value + 1.0) + doc['commentCount'].value * 2.0 + doc['saveCount'].value * 3.0; " +
                                            "return _score * (1.0 + popularityScore * 0.1);")
                            ))))
                            .boostMode(FunctionBoostMode.Replace)
                    ).build();

            SearchResponse<PostDocument> response = elasticsearchClient.search(s -> s
                            .index(ElasticIndexConstant.POST)
                            .query(finalQuery)
                            .from(0)
                            .size(limit)
                    , PostDocument.class
            );

            return mapSearchResponse(response);
        } catch (Exception e) {
            log.error("Elasticsearch related query failed", e);
            return new SearchResult(Collections.emptyList(), 0);
        }
    }

    @Override
    public SearchResult getGlobalRecommendations(int limit) {
        try {
            Query query = new Query.Builder().matchAll(m -> m).build();

            Query finalQuery = new Query.Builder()
                    .functionScore(fs -> fs
                            .query(query)
                            .functions(f -> f.scriptScore(ss -> ss.script(s -> s.inline(in -> in
                                    .source("double popularityScore = Math.log(doc['viewCount'].value + 1.0) + doc['commentCount'].value * 2.0 + doc['saveCount'].value * 3.0; " +
                                            "double diffDays = (params.now - doc['createdAt'].value.toInstant().toEpochMilli()) / 86400000.0; " +
                                            "if (diffDays < 0.0) diffDays = 0.0; " +
                                            "double freshnessScore = 1.0 / (1.0 + diffDays); " +
                                            "return popularityScore * 0.7 + freshnessScore * 0.3;")
                                    .params("now", JsonData.of(System.currentTimeMillis()))
                            ))))
                            .boostMode(FunctionBoostMode.Replace)
                    ).build();

            SearchResponse<PostDocument> response = elasticsearchClient.search(s -> s
                            .index(ElasticIndexConstant.POST)
                            .query(finalQuery)
                            .from(0)
                            .size(limit)
                    , PostDocument.class
            );

            return mapSearchResponse(response);
        } catch (Exception e) {
            log.error("Elasticsearch global recommendation query failed", e);
            return new SearchResult(Collections.emptyList(), 0);
        }
    }

    private SearchResult mapSearchResponse(SearchResponse<PostDocument> response) {
        List<PostDocument> documents = new ArrayList<>();
        if (response.hits() != null && response.hits().hits() != null) {
            for (Hit<PostDocument> hit : response.hits().hits()) {
                if (hit.source() != null) {
                    PostDocument doc = hit.source();
                    doc.setScore(hit.score());
                    documents.add(doc);
                }
            }
        }
        long totalHits = response.hits() != null && response.hits().total() != null ? response.hits().total().value() : 0;
        return new SearchResult(documents, totalHits);
    }
}
