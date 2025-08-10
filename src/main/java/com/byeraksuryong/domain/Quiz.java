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

    @Column(name = "folder_id")
    private String folderId;

    @Column(name = "quiz_id")
    private String quizId;

    @Column(name = "quiz_title")
    private String quizTitle;

    @Column(name = "note_ids", length = 1000) // 여러 noteId를 콤마로 구분해 저장
    private String noteIds;

    @Column(columnDefinition = "TEXT")
    private String question;

    private String answer;

    @Column(name = "type")
    private String type;

    @Column(length = 1000)
    private String solution;

    @Column(name = "user_answer")
    private String userAnswer;

    @Column(name = "is_correct")
    private Boolean isCorrect;
}
