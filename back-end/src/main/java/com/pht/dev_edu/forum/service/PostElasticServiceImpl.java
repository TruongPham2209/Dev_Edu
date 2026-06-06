package com.pht.dev_edu.forum.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.core.GetResponse;
import com.pht.dev_edu.common.constant.ElasticIndexConstant;
import com.pht.dev_edu.forum.document.PostDocument;
import com.pht.dev_edu.forum.dto.PostInteractiveData;
import com.pht.dev_edu.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class PostElasticServiceImpl implements PostElasticService {
    UserService userService;
    ElasticsearchClient elasticsearchClient;

    @Override
    @Transactional
    public void upsertPostContent(PostDocument document) {
        var user = userService.findByUsername(document.getAuthorUsername());
        if (user == null) {
            log.error("User not found, can not sync post data");
            return;
        }

        document.setAuthorAvatarUrl(user.getAvatarUrl());
        document.setAuthorFullName(user.getFullName());

        try {
            GetResponse<PostDocument> getResponse = elasticsearchClient.get(g -> g
                            .index(ElasticIndexConstant.POST)
                            .id(document.getId().toString()),
                    PostDocument.class
            );

            if (getResponse.found() && getResponse.source() != null) {
                PostDocument existingDoc = getResponse.source();
                // Preserve statistics and creation time
                document.setViewCount(existingDoc.getViewCount());
                document.setCommentCount(existingDoc.getCommentCount());
                document.setSaveCount(existingDoc.getSaveCount());
                document.setPopularityScore(existingDoc.getPopularityScore());
                
                if (existingDoc.getCreatedAt() != null) {
                    document.setCreatedAt(existingDoc.getCreatedAt());
                }
                log.debug("Post {} exists, updating content while preserving stats", document.getId());
            }

            elasticsearchClient.index(i -> i
                    .index(ElasticIndexConstant.POST)
                    .id(document.getId().toString())
                    .document(document)
            );
            log.debug("Successfully upserted post {} to Elasticsearch", document.getId());
        } catch (Exception e) {
            log.error("Failed to upsert post {} to Elasticsearch", document.getId(), e);
        }
    }

    @Override
    @Transactional
    public void deletePost(UUID postId) {
        try {
            elasticsearchClient.delete(d -> d
                    .index(ElasticIndexConstant.POST)
                    .id(postId.toString())
            );
            log.debug("Successfully deleted post {} from Elasticsearch", postId);
        } catch (Exception e) {
            log.error("Failed to delete post {} from Elasticsearch", postId, e);
        }
    }

    @Override
    @Transactional
    public void updateInteractiveData(PostInteractiveData interactiveData) {
        if (interactiveData == null || interactiveData.getPostId() == null) {
            return;
        }

        try {
            GetResponse<PostDocument> getResponse = elasticsearchClient.get(g -> g
                            .index(ElasticIndexConstant.POST)
                            .id(interactiveData.getPostId().toString()),
                    PostDocument.class
            );

            if (getResponse.found() && getResponse.source() != null) {
                PostDocument doc = getResponse.source();

                if (interactiveData.getUpdatedAt() != null) {
                    doc.setUpdatedAt(interactiveData.getUpdatedAt().atZone(ZoneId.systemDefault()).toInstant());
                }
                doc.setViewCount(interactiveData.getViewCount());
                doc.setSaveCount(interactiveData.getSaveCount());
                doc.setPopularityScore(interactiveData.getPopularityScore());

                if (interactiveData.getCombinedText() != null) {
                    doc.setCombinedText(interactiveData.getCombinedText());
                }

                elasticsearchClient.index(i -> i
                        .index(ElasticIndexConstant.POST)
                        .id(doc.getId().toString())
                        .document(doc)
                );
                log.debug("Successfully updated interactive data for post {}", doc.getId());
            } else {
                log.warn("Post {} not found in Elasticsearch for interactive data update", interactiveData.getPostId());
            }
        } catch (Exception e) {
            log.error("Failed to update interactive data for post {}", interactiveData.getPostId(), e);
        }
    }
}
