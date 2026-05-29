package com.pht.dev_edu.lecture.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.common.constant.RedisDurationConstant;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.lecture.dto.ProgressResponse;
import com.pht.dev_edu.lecture.dto.ProgressSegmentRequest;
import com.pht.dev_edu.lecture.dto.VideoSegment;
import com.pht.dev_edu.lecture.entity.LectureEntity;
import com.pht.dev_edu.lecture.entity.LectureProgressEntity;
import com.pht.dev_edu.lecture.repo.LectureProgressRepository;
import com.pht.dev_edu.lecture.repo.LectureRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ProgressServiceImpl implements ProgressService {
    LectureProgressRepository lectureProgressRepository;
    LectureRepository lectureRepository;

    ObjectMapper objectMapper;
    RedisTemplate<String, Object> redisTemplate;
    LecturePermissionService lecturePermissionService;

    private static final int PROGRESS_PERCENTAGE_THRESHOLD = 70;

    @Override
    @Transactional
    public ProgressResponse updateProgress(String actor, ProgressSegmentRequest req) {
        if (req.getSegmentStart() > req.getSegmentEnd()) {
            throw new BadRequestException("Invalid segment range");
        }

        if (lectureProgressRepository.existsByLectureIdAndStudent(req.getLectureId(), actor)) {
            return buildProgressResponse(req.getLectureId(), true);
        }

        lecturePermissionService.checkViewPermissionByLecture(Set.of(RoleEnum.STUDENT.name()), actor, req.getLectureId());
        var lecture = RedisUtils.getOptionalDataFromCacheOrDb(
                RedisPrefixConstant.LECTURE_PREFIX + req.getLectureId(),
                LectureEntity.class,
                () -> lectureRepository.findById(req.getLectureId()),
                RedisDurationConstant.LECTURE_DATA_DURATION
        );

        if (lecture == null || lecture.getDeletedAt() != null) {
            throw new DataNotFoundException("Lecture not found");
        }

        if (!lectureRepository.hasCompletedAllPreviousLectures(lecture.getCourseId(), lecture.getLectureOrder(), actor)) {
            throw new BadRequestException("You must complete all previous lectures to access this lecture.");
        }

        if (lecture.getDurationInSeconds() == 0) {
            saveProgress(actor, lecture);
            return buildProgressResponse(req.getLectureId(), true);
        }

        if (req.getSegmentEnd() > lecture.getDurationInSeconds()) {
            throw new BadRequestException("Segment end exceeds lecture duration");
        }

        // Add to redis first, and calculate the total watched duration for this lecture. If the total watched duration exceeds the threshold, save the progress to db
        int totalDuration = calTotalWatchedDuration(
                actor,
                lecture,
                req.getSegmentStart(),
                req.getSegmentEnd()
        );

        if (totalDuration >= lecture.getDurationInSeconds() * PROGRESS_PERCENTAGE_THRESHOLD / 100) {
            saveProgress(actor, lecture);
            redisTemplate.delete(
                    buildLectureProgressRedisKey(actor, lecture.getId())
            );

            return buildProgressResponse(req.getLectureId(), true);
        }

        log.info("Progress not saved for student {} on lecture {} because watched duration {} is less than threshold {}% of total duration {}",
                actor, lecture.getId(), totalDuration, PROGRESS_PERCENTAGE_THRESHOLD, lecture.getDurationInSeconds());
        return buildProgressResponse(req.getLectureId(), false);
    }

    private void saveProgress(String student, LectureEntity lecture) {
        lectureProgressRepository.save(
                LectureProgressEntity.builder()
                        .lectureId(lecture.getId())
                        .student(student)
                        .build()
        );
    }

    private int calTotalWatchedDuration(
            String student,
            LectureEntity lecture,
            int segmentStart,
            int segmentEnd
    ) {

        String redisKey = buildLectureProgressRedisKey(
                student,
                lecture.getId()
        );

        // 1. Load existing segments
        List<VideoSegment> segments = getSegments(redisKey);

        // 2. Add new segment
        segments.add(
                new VideoSegment(segmentStart, segmentEnd)
        );

        // 3. Sort + merge
        List<VideoSegment> mergedSegments =
                mergeSegments(segments);

        // 4. Save merged segments back to redis
        redisTemplate.opsForValue().set(
                redisKey,
                mergedSegments,
                RedisDurationConstant.LECTURE_PROGRESS_DURATION
        );

        // 5. Calculate total watched duration
        return mergedSegments.stream()
                .mapToInt(
                        segment ->
                                segment.getEnd() - segment.getStart()
                )
                .sum();
    }

    private List<VideoSegment> getSegments(String redisKey) {
        Object cached =
                redisTemplate.opsForValue().get(redisKey);

        if (cached == null) {
            return new ArrayList<>();
        }

        return objectMapper.convertValue(
                cached,
                new TypeReference<List<VideoSegment>>() {
                }
        );
    }

    private List<VideoSegment> mergeSegments(
            List<VideoSegment> segments
    ) {

        if (segments.isEmpty()) {
            return segments;
        }

        // Sort by start asc
        segments.sort(
                Comparator.comparingInt(VideoSegment::getStart)
        );

        List<VideoSegment> merged = new ArrayList<>();

        VideoSegment current = segments.get(0);

        for (int i = 1; i < segments.size(); i++) {

            VideoSegment next = segments.get(i);

            /*
             * Overlap:
             *
             * [0,2] + [1,7]
             * => [0,7]
             *
             * [0,7] + [6,10]
             * => [0,10]
             */
            if (next.getStart() <= current.getEnd()) {

                current = new VideoSegment(
                        current.getStart(),
                        Math.max(
                                current.getEnd(),
                                next.getEnd()
                        )
                );

            } else {

                merged.add(current);
                current = next;
            }
        }

        merged.add(current);

        return merged;
    }

    private String buildLectureProgressRedisKey(
            String student,
            UUID lectureId
    ) {

        return RedisPrefixConstant.LECTURE_PROGRESS_PREFIX
                + student
                + ":"
                + lectureId;
    }

    private ProgressResponse buildProgressResponse(
            UUID lectureId,
            boolean completed
    ) {
        return ProgressResponse.builder()
                .lectureId(lectureId)
                .completed(completed)
                .build();
    }
}
