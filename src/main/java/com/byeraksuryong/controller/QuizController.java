package com.byeraksuryong.controller;

import com.byeraksuryong.domain.Quiz;
import com.byeraksuryong.dto.QuizRequest;
import com.byeraksuryong.dto.QuizResultRequest;
import com.byeraksuryong.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {
    private final QuizService quizService;

    @Autowired
    public QuizController(QuizService quizService)
    {
        this.quizService = quizService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody QuizRequest request)
    {
        try{
            return ResponseEntity.ok(quizService.createQuiz(request));
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/get")
    public ResponseEntity<?> get(@RequestBody Map<String, String> body){
        try{
            return ResponseEntity.ok(quizService.getQuizzes(body));
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // 퀴즈 결과 저장 요청 처리
    @PostMapping("/save")
    public String saveQuizResults(@RequestBody List<QuizRequest> requests) {
        try {
            quizService.saveQuizResults(requests);  // 새로 추가할 메서드
            return "저장 완료";
        } catch (Exception e) {
            return "저장 실패: " + e.getMessage();
        }
    }

    @PostMapping("/score")
    public ResponseEntity<?> score(@RequestBody QuizResultRequest request)
    {
        try{
            quizService.scoreAnswers(request);
            return ResponseEntity.ok().build();
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/getQuizInfo")
    public ResponseEntity<?> getQuizInfo(@RequestBody Map<String, String> body)
    {
        try{
            return ResponseEntity.ok(quizService.getQuizInfo(body));
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/getByFolderId")
    public ResponseEntity<?> getByFolderId(@RequestBody Map<String, String> body){
        try{
            return ResponseEntity.ok(quizService.getByFolderId(body));
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }


    @PostMapping("/rename")
    public ResponseEntity<?> rename(@RequestBody Map<String, String> body){
        try{
            quizService.renameQuiz(body);
            return ResponseEntity.ok().build();
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/remove")
    public ResponseEntity<?> delete(@RequestBody Map<String, String> body){
        try{
            quizService.deleteByQuizId(body);
            return ResponseEntity.ok().build();
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
