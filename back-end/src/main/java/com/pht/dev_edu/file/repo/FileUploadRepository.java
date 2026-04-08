package com.pht.dev_edu.file.repo;

import com.pht.dev_edu.file.entity.FileUploadEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.Optional;
import java.util.UUID;

public interface FileUploadRepository extends JpaRepository<FileUploadEntity, UUID> {
    Optional<FileUploadEntity> findByObjectKey(String objectKey);

    @Modifying
    void deleteByObjectKey(String objectKey);
}