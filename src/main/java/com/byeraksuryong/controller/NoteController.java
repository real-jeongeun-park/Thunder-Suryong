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

@RequestMapping("/api")
@RestController
public class NoteController {
    private final NoteService noteService;

    public NoteController(NoteService noteService){
        this.noteService = noteService;
    }

    @PostMapping("/createNote")
    public ResponseEntity<?> receiveNoteName(@RequestBody NoteRequest noteRequest){
        try{
            noteService.createNote(noteRequest);
            return ResponseEntity.ok(true);
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping("/printNotes")
    public ResponseEntity<?> printNotes(@RequestBody Map<String, Long> body){
        try{
            List<Map<String, String>> notes = noteService.getNotes(body);
            return ResponseEntity.ok(notes);
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping("/printOneNote")
    public ResponseEntity<?> printOneNote(@RequestBody Map<String, String> body){
        try{
            Map<String, String> note = noteService.getOneNote(body);
            return ResponseEntity.ok(note);
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping("/updateNote")
    public ResponseEntity<?> updateNote(@RequestBody Map<String, String> body){
        try{
            noteService.updateNote(body);
            return ResponseEntity.ok(true);
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}
