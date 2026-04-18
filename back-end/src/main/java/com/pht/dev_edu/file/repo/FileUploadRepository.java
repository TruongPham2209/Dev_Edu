package com.pht.dev_edu.file.repo;

import com.pht.dev_edu.file.entity.FileUploadEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FileUploadRepository extends JpaRepository<FileUploadEntity, UUID> {
    Optional<FileUploadEntity> findByObjectKey(String objectKey);

    @Modifying
    void deleteByObjectKey(String objectKey);

    @Modifying // Remove if error occurs, but should be needed for delete operations
    @Query(value = """
                DELETE FROM file_upload_entity
                WHERE status IN ('FAILED', 'PENDING')
                AND expired_at < :cutoffDate
                RETURNING object_key
            """, nativeQuery = true)
    List<String> deleteExpiredAndFailedFiles(LocalDateTime cutoffDate);
}