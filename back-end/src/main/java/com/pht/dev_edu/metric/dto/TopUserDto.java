package com.pht.dev_edu.metric.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class TopUserDto {
    List<TopStudentDto> topStudents;
    List<TopContributorDto> topContributors;
}
