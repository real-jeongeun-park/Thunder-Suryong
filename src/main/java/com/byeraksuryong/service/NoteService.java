package com.byeraksuryong.service;

import com.byeraksuryong.domain.Note;
import com.byeraksuryong.dto.NoteRequest;
import com.byeraksuryong.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Transactional
@Service
public class NoteService {
    private final NoteRepository noteRepository;

    @Autowired
    public NoteService(NoteRepository noteRepository){
        this.noteRepository = noteRepository;
    }

    public Note createNote(NoteRequest noteRequest){
        Note note = new Note();
        note.setFolderId(noteRequest.getFolderId());
        note.setNoteId(noteRequest.getNoteId());
        note.setTitle(noteRequest.getTitle());
        return noteRepository.save(note);
    }

    public List<Map<String, String>> getNotes(Map<String, Long> body){
        Long folderId = body.get("folderId");
        if(folderId != null){
            // folderId 있는 경우만
            return noteRepository.findByFolderId(folderId).stream()
                    .map(note -> {
                        Map<String, String> map = new HashMap<>();
                        map.put("noteId", note.getNoteId());
                        map.put("title", note.getTitle());
                        return map;
                    })
                    .collect(Collectors.toList());
        }
        else{
            return null;
        }
    }

    public Map<String, String> getOneNote(Map<String, String> body){
        String noteId = body.get("noteId");
        if(noteId != null){
            Note note = noteRepository.findByNoteId(noteId).get(0);
            Map<String, String> noteInfo = new HashMap<>();
            noteInfo.put("title", note.getTitle());
            noteInfo.put("content", note.getContent());
            return noteInfo;
        }
        else{
            return null;
        }
    }

    public Note updateNote(@RequestBody Map<String, String> body){
        String noteId = body.get("noteId");
        String title = body.get("title");
        String content = body.get("content");

        Note note = noteRepository.findByNoteId(noteId).get(0);
        note.setTitle(title);
        note.setContent(content);
        return note;
    }
}
