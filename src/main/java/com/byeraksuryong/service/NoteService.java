package com.byeraksuryong.service;

import com.byeraksuryong.domain.Note;
import com.byeraksuryong.dto.NoteRequest;
import com.byeraksuryong.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.*;
import java.util.stream.Collectors;

@Transactional
@Service
public class NoteService {
    private final NoteRepository noteRepository;

    @Autowired
    public NoteService(NoteRepository noteRepository){
        this.noteRepository = noteRepository;
    }

    public String createNote(NoteRequest noteRequest){
        Note note = new Note();
        note.setFolderId(noteRequest.getFolderId());

        String key = UUID.randomUUID().toString();
        note.setNoteId(key);

        note.setTitle(noteRequest.getTitle());
        return noteRepository.save(note).getNoteId();
    }

    public List<Map<String, String>> getNotes(Map<String, String> body){
        String folderId = body.get("folderId");
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

    public List<List<String>> findByFolderId(String folderId){
        List<Note> notes = noteRepository.findByFolderId(folderId);
        if(notes.isEmpty()) throw new RuntimeException("no notes found");

        List<String> noteIds = notes.stream()
                .map(Note::getNoteId)
                .collect(Collectors.toList());

        List<String> noteTitles = notes.stream()
                .map(Note::getTitle)
                .collect(Collectors.toList());

        List<List<String>> newList = new ArrayList<>();
        newList.add(noteIds);
        newList.add(noteTitles);

        return newList;
    }
}
