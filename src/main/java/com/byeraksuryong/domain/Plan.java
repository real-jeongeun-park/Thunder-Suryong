package com.byeraksuryong.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Plan {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "exam_id")
    private Long examId; // 시험 테이블 ID
    private String week; // 주차 명
    private String content; // 분량
    private String date; // 공부 계획일
    private boolean learned; // 공부 여부
}