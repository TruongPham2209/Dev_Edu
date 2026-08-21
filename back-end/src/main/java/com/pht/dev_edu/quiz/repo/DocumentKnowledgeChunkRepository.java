package com.pht.dev_edu.quiz.repo;

import com.pht.dev_edu.quiz.entity.DocumentKnowledgeChunkEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentKnowledgeChunkRepository extends JpaRepository<DocumentKnowledgeChunkEntity, UUID> {

    List<DocumentKnowledgeChunkEntity> findByDocumentId(UUID documentId);

    Optional<DocumentKnowledgeChunkEntity> findByDocumentIdAndContentHash(UUID documentId, String contentHash);

    void deleteByDocumentId(UUID documentId);

    @Query(value = """
            SELECT d.*
            FROM document_knowledge_chunks d
            WHERE d.document_id = :documentId
            ORDER BY d.embedding <=> CAST(:queryVector AS vector) ASC
            LIMIT :limit
            """, nativeQuery = true)
    List<DocumentKnowledgeChunkEntity> findSimilarChunks(
            @Param("documentId") UUID documentId,
            @Param("queryVector") String queryVector,
            @Param("limit") int limit
    );
}
