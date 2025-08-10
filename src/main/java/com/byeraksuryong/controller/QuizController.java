package com.byeraksuryong.controller;

import com.byeraksuryong.domain.Quiz;
import com.byeraksuryong.dto.QuizRequest;
import com.byeraksuryong.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// 퀴즈 생성 요청을 처리하는 컨트롤러
@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    private final QuizService quizService;

    @Autowired
    public QuizController(QuizService quizService)
    {
        this.quizService = quizService;
    }

    // GPT 기반 퀴즈 생성 요청 처리
    @PostMapping("/generate")
    public List<String> generateQuiz(@RequestBody QuizRequest request)
    {
        return quizService.generateQuiz(request);
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

    @PostMapping("/getByNickname")
    public List<Quiz> getByNickname(@RequestBody Map<String, String> request) {
        String nickname = request.get("nickname");
        return quizService.getQuizzesByNickname(nickname);
    }
}
