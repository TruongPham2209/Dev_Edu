package com.pht.dev_edu.livestream.entity;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@ToString
//@Entity
//@Table(name = "livestream")
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LivestreamEntity {
//    @Id
//    @Column(nullable = false, updatable = false)
//    UUID id;
//
//    @Column(name = "course_id", nullable = false)
//    UUID courseId;
//
//    @Column(nullable = false)
//    String title;
//
//    @Column(name = "stream_url", columnDefinition = "TEXT")
//    String streamUrl;
//
//    @Column(name = "start_time")
//    LocalDateTime startTime;
//
//    @Column(name = "end_time")
//    LocalDateTime endTime;
//
//    @PrePersist
//    public void prePersist() {
//        if (id == null) {
//            id = UuidCreator.getTimeOrderedEpoch();
//        }
//    }
}
