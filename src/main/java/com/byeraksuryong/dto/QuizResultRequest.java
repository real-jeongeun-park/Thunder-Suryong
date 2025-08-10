package com.byeraksuryong.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
public class QuizResultRequest {
    private List<Map<String, String>> userAnswers;
    private String quizId;
}
