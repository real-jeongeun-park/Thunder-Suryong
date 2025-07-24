package com.byeraksuryong.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Note {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "folder_id")
    private Long folderId;
    @Column(name = "note_id")
    private String noteId;
    private String title;
    private String content;
}
