package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.quiz.dto.response.CourseDocumentResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * Service for managing the global document library (Global Document Library) for courses.
 * Supports cursor-based pagination, admin PDF uploads, and soft deletion.
 */
public interface CourseDocumentService {

    /**
     * Retrieves documents from the global library (visibility = GLOBAL, status = READY) using cursor pagination.
     *
     * @param nextCursor the encoded cursor token for the next page (null or empty for the first page).
     * @param fileName   optional filter by file name or document title.
     * @return a {@link CustomPaging} containing {@link CourseDocumentResponse} items.
     */
    CustomPaging<CourseDocumentResponse> getGlobalDocumentLibrary(String nextCursor, String fileName);

    /**
     * Allows administrators to upload a PDF document directly into the global library without quiz generation.
     *
     * @param file     the PDF {@link MultipartFile} to upload.
     * @param title    the optional title of the document.
     * @param username the username of the administrator uploading the file.
     * @return the saved {@link CourseDocumentResponse}.
     */
    CourseDocumentResponse uploadGlobalDocumentByAdmin(
            MultipartFile file,
            String title,
            String username
    );

    /**
     * Soft-deletes a document from the global library.
     *
     * @param documentId the UUID of the document to delete.
     * @param username   the username of the user performing the deletion.
     */
    void deleteGlobalDocument(UUID documentId, String username);
}
