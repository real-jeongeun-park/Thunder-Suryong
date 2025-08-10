package com.byeraksuryong.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
public class QuizFolder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "exam_id")
    private String examId;
    private String nickname;
    @Column(name = "folder_id")
    private String folderId;
    @Column(name = "folder_name")
    private String folderName;
}
