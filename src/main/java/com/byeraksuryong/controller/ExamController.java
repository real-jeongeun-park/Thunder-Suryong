package com.byeraksuryong.controller;

import com.byeraksuryong.service.ExamService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class ExamController {
    private final ExamService examService;
    public ExamController(ExamService examService){
        this.examService = examService;
    }

    @PostMapping("/api/createExam")
    public ResponseEntity<?> receiveExam(@RequestBody Map<String, Object> body){
        try{
            examService.createExam(body);
            return ResponseEntity.ok(true);
        } catch(Exception e){
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}
