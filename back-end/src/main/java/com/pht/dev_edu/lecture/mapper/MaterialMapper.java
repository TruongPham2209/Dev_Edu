package com.pht.dev_edu.lecture.mapper;

import com.pht.dev_edu.lecture.dto.MaterialRequest;
import com.pht.dev_edu.lecture.dto.MaterialResponse;
import com.pht.dev_edu.lecture.entity.LectureMaterialEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MaterialMapper {
    @Mapping(target = "uploadedAt", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "fileType", ignore = true)
    @Mapping(target = "fileOriginalName", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    LectureMaterialEntity reqToEntity(MaterialRequest req);

    MaterialResponse entityToRes(LectureMaterialEntity entity);
}
