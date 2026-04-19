package com.pht.dev_edu.lecture.service;

import com.pht.dev_edu.common.constant.RedisDurationConstant;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.lecture.dto.ProgressSegmentRequest;
import com.pht.dev_edu.lecture.entity.LectureEntity;
import com.pht.dev_edu.lecture.entity.LectureProgressEntity;
import com.pht.dev_edu.lecture.repo.LectureProgressRepository;
import com.pht.dev_edu.lecture.repo.LectureRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ProgressServiceImpl implements ProgressService {
    LectureProgressRepository lectureProgressRepository;
    LectureRepository lectureRepository;

    LecturePermissionService lecturePermissionService;

    private static final int PROGRESS_PERCENTAGE_THRESHOLD = 70;

    @Override
    @Transactional
    public void updateProgress(String actor, ProgressSegmentRequest req) {
        lecturePermissionService.checkViewPermissionByLecture(Set.of(RoleEnum.STUDENT.name()), actor, req.getLectureId());
        var lecture = RedisUtils.getDataFromCacheOrDb(
                RedisPrefixConstant.LECTURE_PREFIX + req.getLectureId(),
                LectureEntity.class,
                () -> lectureRepository.findById(req.getLectureId()),
                RedisDurationConstant.LECTURE_DATA_DURATION
        );

        if (lecture == null) {
            throw new DataNotFoundException("Lecture not found");
        }

        if (lecture.getDurationInSeconds() == 0) {
            saveProgress(actor, lecture);
            return;
        }

        // Add to redis first, and calculate the total watched duration for this lecture. If the total watched duration exceeds the threshold, save the progress to db
        var totalDuration = calTotalWatchedDuration(actor, lecture);
        if (totalDuration > lecture.getDurationInSeconds() * PROGRESS_PERCENTAGE_THRESHOLD / 100) {
            saveProgress(actor, lecture);
        } else {
            log.info("Progress not saved for student {} on lecture {} because watched duration {} is less than threshold {}% of total duration {}",
                    actor, lecture.getId(), totalDuration, PROGRESS_PERCENTAGE_THRESHOLD, lecture.getDurationInSeconds());
            // Save to redis that the student has watched this segment, so that we can calculate the total watched duration later
        }
    }

    private void saveProgress(String student, LectureEntity lecture) {
        if (lectureProgressRepository.existsByLectureIdAndStudent(lecture.getId(), student)) {
            return;
        }

        lectureProgressRepository.save(
                LectureProgressEntity.builder()
                        .lectureId(lecture.getId())
                        .student(student)
                        .build()
        );
    }

    private int calTotalWatchedDuration(String student, LectureEntity lecture) {
        return 0;
    }
}
