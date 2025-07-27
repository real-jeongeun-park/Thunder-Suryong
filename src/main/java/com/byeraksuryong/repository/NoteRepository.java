package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Note;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository {
    Note save(Note note);
    List<Note> findByFolderId(String folderId);
    List<Note> findByNoteId(String noteId);
}