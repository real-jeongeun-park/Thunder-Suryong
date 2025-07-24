package com.byeraksuryong.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NoteRequest {
    private Long folderId;
    private String noteId;
    private String title;
}
