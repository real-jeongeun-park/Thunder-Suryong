package com.byeraksuryong.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "exam_id")
    private String examId;

    @Column(name = "quiz_title")
    private String quizTitle;

    @Column(name = "note_ids", length = 1000) // 여러 noteId를 콤마로 구분해 저장
    private String noteIds;

    @Column(columnDefinition = "TEXT")
    private String question;

    private String answer;

    private String nickname;  // 사용자 식별자 (닉네임 기준)

    @Column(name = "type")
    private String type;

    @Column(length = 1000)
    private String solution;
}
