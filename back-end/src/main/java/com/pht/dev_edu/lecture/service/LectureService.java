package com.pht.dev_edu.lecture.service;

import com.pht.dev_edu.lecture.dto.LectureRequest;
import com.pht.dev_edu.lecture.dto.LectureResponse;
import com.pht.dev_edu.lecture.entity.LectureEntity;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface LectureService {
    List<LectureResponse> getLecturesByCourse(Set<String> authorities, String actor, UUID courseId);

    LectureResponse getLecture(Set<String> authorities, String actor, UUID lectureId);

    LectureEntity getLectureById(UUID lectureId);

    LectureResponse createLecture(Set<String> authorities, String actor, LectureRequest req);

    LectureResponse updateLecture(Set<String> authorities, String actor, LectureRequest req);

    void deleteLecture(Set<String> authorities, String actor, UUID lectureId);

    void deleteById(UUID lectureId);
}
