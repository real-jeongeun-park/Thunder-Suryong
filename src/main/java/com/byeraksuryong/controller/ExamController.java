package com.byeraksuryong.controller;

import com.byeraksuryong.service.ExamService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/get")
    public ResponseEntity<?> getExams(@RequestBody Map<String, String> body){
        try{
            return ResponseEntity.ok(examService.getExams(body));
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @GetMapping("/id")
    public ResponseEntity<?> changeDefaultExam(@RequestParam("id") String id){
        try{
            examService.changeDefaultExam(id);
            return ResponseEntity.ok().build();
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}
