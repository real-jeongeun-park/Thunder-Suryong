package com.byeraksuryong.controller;

import com.byeraksuryong.dto.SubjectRequest;
import com.byeraksuryong.service.SubjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RequestMapping("/api/subject")
@RestController
public class SubjectController {
    private final SubjectService subjectService;
    public SubjectController(SubjectService subjectService){
        this.subjectService = subjectService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> receiveSubjects(@RequestBody SubjectRequest subjectRequest){
        try{
            subjectService.createSubject(subjectRequest);
            return ResponseEntity.ok(true);
        } catch(Exception e){
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}
