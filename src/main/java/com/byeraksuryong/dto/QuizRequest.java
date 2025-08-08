package com.byeraksuryong.dto;

import java.util.List;

// 프론트에서 퀴즈 생성 요청 시 전달받는 JSON 구조
public class QuizRequest {

    private List<String> noteIds; // 선택한 노트들의 식별자 (NOTE_ID 리스트)
    private String quizTitle; // 문제지 제목
    private List<String> problemTypes; // 문제 유형들(객관식, 주관식, OX)
    private int problemCount; // 생성할 문제 수
    private String nickname; // 사용자 닉네임
    private String inputText;
    private String question;
    private String answer;
    private String type;
    private String solution;


    public List<String> getNoteIds() {
        return noteIds;
    }

    public void setNoteIds(List<String> noteIds) {
        this.noteIds = noteIds;
    }

    public String getQuizTitle() {
        return quizTitle;
    }

    public void setQuizTitle(String quizTitle) {
        this.quizTitle = quizTitle;
    }

    public List<String> getProblemTypes() {
        return problemTypes;
    }

    public void setProblemTypes(List<String> problemTypes) {
        this.problemTypes = problemTypes;
    }

    public int getProblemCount() {
        return problemCount;
    }

    public void setProblemCount(int problemCount) {
        this.problemCount = problemCount;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getInputText() {
        return inputText;
    }

    public void setInputText(String inputText) {
        this.inputText = inputText;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSolution() {
        return solution;
    }

    public void setSolution(String solution) {
        this.solution = solution;
    }
}

