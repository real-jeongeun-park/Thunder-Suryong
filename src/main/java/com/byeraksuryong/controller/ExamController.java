package com.byeraksuryong.controller;

import com.byeraksuryong.service.ExamService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RequestMapping("/api/exam")
@RestController
public class ExamController {
    private final ExamService examService;
    public ExamController(ExamService examService){
        this.examService = examService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> receiveExam(@RequestBody Map<String, String> body){
        try{
            String examId = examService.createExam(body).getExamId();
            return ResponseEntity.ok(examId);
        } catch(Exception e){
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}
