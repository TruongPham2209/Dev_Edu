package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.chat.service.OpenAiService;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.quiz.entity.CourseDocumentEntity;
import com.pht.dev_edu.quiz.entity.DocumentKnowledgeChunkEntity;
import com.pht.dev_edu.quiz.repo.DocumentKnowledgeChunkRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DocumentProcessingServiceImpl implements DocumentProcessingService {
    DocumentKnowledgeChunkRepository chunkRepository;
    OpenAiService openAiService;

    private static final int TARGET_CHUNK_SIZE_WORDS = 350;
    private static final double MIN_QUALITY_PRINTABLE_RATIO = 0.70;

    @Override
    @Transactional
    public List<DocumentKnowledgeChunkEntity> processAndStoreDocument(
            CourseDocumentEntity document,
            InputStream fileStream) {
        if (document == null || document.getId() == null) {
            throw new BadRequestException("Document entity is required for chunk processing.");
        }
        log.info("Processing document file {} (id={})", document.getFileName(), document.getId());
        try {
            byte[] fileBytes = fileStream.readAllBytes();
            if (fileBytes == null || fileBytes.length == 0) {
                throw new BadRequestException("Uploaded document file is empty.");
            }

            Map<Integer, String> pageTextMap = new HashMap<>();
            String fullText = "";

            String documentName = document.getFileName();
            if (documentName != null && documentName.toLowerCase().endsWith(".pdf")) {
                try (PDDocument pdDoc = Loader.loadPDF(fileBytes)) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    int totalPages = pdDoc.getNumberOfPages();
                    StringBuilder fullSb = new StringBuilder();
                    for (int i = 1; i <= totalPages; i++) {
                        stripper.setStartPage(i);
                        stripper.setEndPage(i);
                        String pageText = stripper.getText(pdDoc);
                        pageTextMap.put(i, pageText);
                        fullSb.append(pageText).append("\n");
                    }
                    fullText = fullSb.toString();
                }
            } else {
                fullText = new String(fileBytes, StandardCharsets.UTF_8);
                pageTextMap.put(1, fullText);
            }

            validateContentQuality(fullText);
            return createAndSaveChunks(document, pageTextMap, fullText);
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to extract text from document {}", document.getFileName(), e);
            throw new BadRequestException("Could not read document text: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public List<DocumentKnowledgeChunkEntity> processAndStoreText(
            CourseDocumentEntity document,
            String rawText) {
        if (document == null || document.getId() == null) {
            throw new BadRequestException("Document entity is required for chunk processing.");
        }
        log.info("Processing raw text for document {} (id={})", document.getFileName(), document.getId());
        validateContentQuality(rawText);
        Map<Integer, String> pageTextMap = Map.of(1, rawText);
        return createAndSaveChunks(document, pageTextMap, rawText);
    }

    private void validateContentQuality(String text) {
        if (text == null || text.trim().isEmpty()) {
            throw new BadRequestException("Document contains no text content.");
        }

        long printableChars = text.chars()
                .filter(ch -> Character.isLetterOrDigit(ch) || Character.isWhitespace(ch) || isPunctuation(ch))
                .count();

        double ratio = (double) printableChars / Math.max(1, text.length());
        if (ratio < MIN_QUALITY_PRINTABLE_RATIO) {
            log.warn("Low text quality detected (printable ratio: {}). OCR may be corrupt.", ratio);
            throw new BadRequestException("Document OCR quality is too low or contains unreadable gibberish text.");
        }
    }

    private boolean isPunctuation(int ch) {
        return ".!?,;:'\"-()[]{}@#/".indexOf(ch) >= 0;
    }

    private List<DocumentKnowledgeChunkEntity> createAndSaveChunks(
            CourseDocumentEntity document,
            Map<Integer, String> pageTextMap,
            String fullText) {

        List<DocumentKnowledgeChunkEntity> result = new ArrayList<>();
        List<String> rawChunks = splitIntoParagraphChunks(fullText, TARGET_CHUNK_SIZE_WORDS);

        int chunkIdx = 0;
        for (String chunkText : rawChunks) {
            if (chunkText.trim().length() < 30) {
                continue;
            }

            String hash = computeSha256(chunkText);
            Optional<DocumentKnowledgeChunkEntity> existing = chunkRepository.findByDocumentIdAndContentHash(document.getId(), hash);
            if (existing.isPresent()) {
                result.add(existing.get());
                continue;
            }

            int estimatedPage = resolvePageNumber(chunkText, pageTextMap);
            String sectionName = extractSectionHeader(chunkText);

            List<Float> embeddingList = openAiService.createEmbedding(chunkText);
            String vectorStr = embeddingList.toString();

            DocumentKnowledgeChunkEntity chunkEntity = DocumentKnowledgeChunkEntity.builder()
                    .documentId(document.getId())
                    .sectionName(sectionName)
                    .pageNumber(estimatedPage)
                    .chunkIndex(chunkIdx++)
                    .content(chunkText)
                    .contentHash(hash)
                    .embedding(vectorStr)
                    .build();

            result.add(chunkRepository.save(chunkEntity));
        }

        if (result.isEmpty()) {
            throw new BadRequestException("No usable knowledge units could be extracted from the document.");
        }

        return result;
    }

    private List<String> splitIntoParagraphChunks(String text, int targetWords) {
        List<String> chunks = new ArrayList<>();
        String[] paragraphs = text.split("\n\\s*\n");
        StringBuilder currentSb = new StringBuilder();
        int currentWordCount = 0;

        for (String para : paragraphs) {
            String cleanPara = para.trim();
            if (cleanPara.isEmpty()) continue;

            int paraWords = cleanPara.split("\\s+").length;
            if (currentWordCount + paraWords > targetWords && currentSb.length() > 0) {
                chunks.add(currentSb.toString().trim());
                currentSb.setLength(0);
                currentWordCount = 0;
            }

            currentSb.append(cleanPara).append("\n\n");
            currentWordCount += paraWords;
        }

        if (currentSb.length() > 0) {
            chunks.add(currentSb.toString().trim());
        }

        return chunks;
    }

    private int resolvePageNumber(String chunkText, Map<Integer, String> pageTextMap) {
        String snippet = chunkText.substring(0, Math.min(100, chunkText.length()));
        for (Map.Entry<Integer, String> entry : pageTextMap.entrySet()) {
            if (entry.getValue().contains(snippet)) {
                return entry.getKey();
            }
        }
        return 1;
    }

    private String extractSectionHeader(String chunkText) {
        String[] lines = chunkText.split("\n");
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.length() > 3 && trimmed.length() < 100 &&
                    (trimmed.matches("^(#+|[0-9]+(\\.[0-9]+)*|Chapter|Section|Chương|Bài|Mục).*") || trimmed.toUpperCase().equals(trimmed))) {
                return trimmed.replaceAll("^[#\\s]+", "");
            }
        }
        return "General Content";
    }

    private String computeSha256(String text) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(text.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            return String.valueOf(text.hashCode());
        }
    }
}
