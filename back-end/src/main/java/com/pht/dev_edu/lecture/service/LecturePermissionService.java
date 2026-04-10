package com.pht.dev_edu.lecture.service;

import java.util.Set;
import java.util.UUID;

public interface LecturePermissionService {
    void checkViewPermissionByLecture(Set<String> authorities, String actor, UUID lectureId);

    void checkModifyPermissionByLecture(Set<String> authorities, String actor, UUID lectureId);

    void checkModifyPermissionByCourse(Set<String> authorities, String actor, UUID courseId);
}
