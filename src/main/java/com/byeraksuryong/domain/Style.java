package com.byeraksuryong.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
public class Style {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nickname;

    @Column(name = "study_time")
    private String studyTime;

    @Column(name = "study_subject")
    private String studySubject;

    @Column(name = "study_style")
    private String studyStyle;
}