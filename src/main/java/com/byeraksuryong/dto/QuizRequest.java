package com.byeraksuryong.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class QuizRequest {
    private List<String> noteIds;
    private String quizTitle;
    private List<String> problemTypes;
    private int problemCount;
    private String nickname;
    private String inputText;
    private String folderId;
    private String question;
    private String answer;
    private String type;
    private String solution;
}