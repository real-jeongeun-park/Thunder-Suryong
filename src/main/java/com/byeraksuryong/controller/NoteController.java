package com.byeraksuryong.controller;

import com.byeraksuryong.dto.NoteRequest;
import com.byeraksuryong.service.NoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RequestMapping("/api/note")
@RestController
public class NoteController {
    private final NoteService noteService;

    public NoteController(NoteService noteService){
        this.noteService = noteService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> receiveNoteName(@RequestBody NoteRequest noteRequest){
        try{
            return ResponseEntity.ok(noteService.createNote(noteRequest));
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping("/get")
    public ResponseEntity<?> printNotes(@RequestBody Map<String, String> body){
        try{
            return ResponseEntity.ok(noteService.getNotes(body));
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping("/getOne")
    public ResponseEntity<?> printOneNote(@RequestBody Map<String, String> body){
        try{
            Map<String, String> note = noteService.getOneNote(body);
            return ResponseEntity.ok(note);
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateNote(@RequestBody Map<String, String> body){
        try{
            noteService.updateNote(body);
            return ResponseEntity.ok(true);
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping("/rename")
    public ResponseEntity<?> rename(@RequestBody Map<String, String> body){
        try{
            noteService.renameNote(body);
            return ResponseEntity.ok().build();
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/remove")
    public ResponseEntity<?> delete(@RequestBody Map<String, String> body){
        try{
            noteService.deleteByNoteId(body);
            return ResponseEntity.ok().build();
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
