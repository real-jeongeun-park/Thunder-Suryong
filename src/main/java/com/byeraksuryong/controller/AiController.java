package com.byeraksuryong.controller;

import com.byeraksuryong.dto.SubjectInfoList;
import com.byeraksuryong.dto.SyllabusList;
import com.byeraksuryong.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RequestMapping("/api/ai")
@RestController
public class AiController {
    private final AiService aiService;

    public AiController(AiService aiService){
        this.aiService = aiService;
    }

    @PostMapping("/schedule")
    public ResponseEntity<?> extractSchedule(@RequestBody Map<String, String> body) {
        try {
            List<String> result = aiService.useScheduleAi(body.get("request"));
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/syllabus")
    public ResponseEntity<?> extractSyllabus(@RequestBody Map<String, String> body) {
        try {
            SyllabusList result = aiService.useSyllabusAi(body.get("request"));
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/plan")
    public ResponseEntity<?> getPlans(@RequestBody Map<String, Object> body){
        try{
            SubjectInfoList list = aiService.usePlansAi(body);
            return ResponseEntity.ok(list);
        } catch(Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/chatInput")
    public ResponseEntity<?> receiveChatInput(@RequestBody Map<String, String> body){
        try{
            String result = aiService.getChatInput(body);
            return ResponseEntity.ok(result);
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

