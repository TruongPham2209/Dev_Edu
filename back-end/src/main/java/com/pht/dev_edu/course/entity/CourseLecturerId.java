package com.pht.dev_edu.course.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@FieldDefaults(level = AccessLevel.PRIVATE)
@Embeddable
public class CourseLecturerId implements Serializable {
    @Column(name = "course_id", nullable = false)
    UUID courseId;

    @Column(name = "lecturer_id", nullable = false)
    UUID lecturerId;
}