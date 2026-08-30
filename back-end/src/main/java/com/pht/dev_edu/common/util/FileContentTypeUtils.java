package com.pht.dev_edu.common.util;

import org.springframework.util.StringUtils;

import java.util.List;

/**
 * Utility class for validating MIME content types against allowed media/document categories.
 */
public class FileContentTypeUtils {

    private static final List<String> PDFS = List.of(
            "application/pdf"
    );

    private static final List<String> WORDS = List.of(
            "application/msword", // .doc
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
            "application/vnd.ms-word.document.macroEnabled.12" // .docm
    );

    private static final List<String> EXCELS = List.of(
            "application/vnd.ms-excel", // .xls
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
            "application/vnd.ms-excel.sheet.macroEnabled.12" // .xlsm
    );

    private static final List<String> POWERPOINTS = List.of(
            "application/vnd.ms-powerpoint", // .ppt
            "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
            "application/vnd.ms-powerpoint.presentation.macroEnabled.12" // .pptm
    );

    private static final List<String> IMAGES = List.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/bmp",
            "image/webp",
            "image/svg+xml",
            "image/tiff",
            "image/x-icon" // .ico
    );

    private static final List<String> VIDEOS = List.of(
            "video/mp4",
            "video/x-msvideo", // .avi
            "video/x-matroska", // .mkv
            "video/webm",
            "video/quicktime", // .mov
            "video/x-ms-wmv", // .wmv
            "video/mpeg"
    );

    private static final List<String> AUDIOS = List.of(
            "audio/mpeg", // .mp3
            "audio/wav",
            "audio/ogg",
            "audio/webm",
            "audio/aac",
            "audio/flac"
    );

    private static final List<String> ARCHIVES = List.of(
            "application/zip",
            "application/x-zip-compressed",
            "application/x-rar-compressed",
            "application/vnd.rar",
            "application/x-7z-compressed",
            "application/gzip",
            "application/x-tar"
    );

    private static final List<String> TEXTS = List.of(
            "text/plain",
            "text/csv",
            "text/html",
            "application/json",
            "application/xml",
            "text/xml"
    );

    /**
     * Supported high-level file classification types.
     */
    public enum FileType {
        DOCUMENT, IMAGE, VIDEO, AUDIO, ARCHIVE
    }

    /**
     * Validates whether the given MIME content type matches at least one allowed {@link FileType}.
     *
     * @param contentType  the MIME content type to check (e.g. "application/pdf").
     * @param allowedTypes the allowed {@link FileType} categories.
     * @return true if the content type is permitted, false otherwise.
     */
    public static boolean isValidContentType(String contentType, FileType... allowedTypes) {
        if (!StringUtils.hasText(contentType) || allowedTypes == null || allowedTypes.length == 0) {
            return false;
        }

        for (FileType type : allowedTypes) {
            switch (type) {
                case DOCUMENT -> {
                    if (PDFS.contains(contentType) || WORDS.contains(contentType) || EXCELS.contains(contentType) || POWERPOINTS.contains(contentType) || TEXTS.contains(contentType)) {
                        return true;
                    }
                }
                case IMAGE -> {
                    if (IMAGES.contains(contentType)) {
                        return true;
                    }
                }
                case VIDEO -> {
                    if (VIDEOS.contains(contentType)) {
                        return true;
                    }
                }
                case AUDIO -> {
                    if (AUDIOS.contains(contentType)) {
                        return true;
                    }
                }
                case ARCHIVE -> {
                    if (ARCHIVES.contains(contentType)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
