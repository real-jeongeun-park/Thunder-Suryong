package com.byeraksuryong.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SubjectRequest {
    private String examId;
    private List<String> subjects;
    private List<String> subjectDates;
}