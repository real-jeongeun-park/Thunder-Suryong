package com.byeraksuryong.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
public class Subject {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "exam_id")
    private String examId;

    @Column(name = "subject_id")
    private String subjectId;
    private String subject;

    @Column(name = "exam_date")
    private LocalDate examDate;
}