package com.pht.dev_edu.file.service;

import com.pht.dev_edu.file.dto.MultipartUploadSession;

import java.time.Duration;
import java.util.Optional;

/**
 * Storage abstraction for multipart upload session metadata.
 * Persists control plane session state without altering relational database schemas.
 */
public interface FileMultipartSessionStore {

    /**
     * Saves or updates the multipart upload session with a time-to-live duration.
     *
     * @param session the multipart upload session.
     * @param ttl     the time-to-live expiration.
     */
    void save(MultipartUploadSession session, Duration ttl);

    /**
     * Retrieves an active multipart upload session by its unique session ID.
     *
     * @param sessionId the session ID.
     * @return an {@link Optional} containing the session if present.
     */
    Optional<MultipartUploadSession> findById(String sessionId);

    /**
     * Deletes a multipart upload session.
     *
     * @param sessionId the session ID to evict.
     */
    void delete(String sessionId);
}
