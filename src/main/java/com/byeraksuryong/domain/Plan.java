package com.byeraksuryong.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Getter
@Setter
public class Plan {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "subject_id")
    private String subjectId;
    private String week; // 주차 명
    private String content; // 분량

    @Column(name = "date")
    private LocalDate date; // 공부 계획일
    private boolean learned; // 공부 여부
}