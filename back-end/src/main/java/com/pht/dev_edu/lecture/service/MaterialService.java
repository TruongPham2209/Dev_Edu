package com.pht.dev_edu.lecture.service;

import com.pht.dev_edu.lecture.dto.MaterialRequest;
import com.pht.dev_edu.lecture.dto.MaterialResponse;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface MaterialService {
    List<MaterialResponse> getMaterialsByLecture(Set<String> authorities, String actor, UUID lectureId);

    MaterialResponse create(Set<String> authorities, String actor, MaterialRequest req);

    void delete(Set<String> authorities, String actor, UUID materialId);
}
