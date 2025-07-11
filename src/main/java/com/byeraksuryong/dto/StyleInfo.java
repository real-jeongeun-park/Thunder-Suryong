package com.byeraksuryong.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class StyleInfo {
    private String studyTime;
    private String studySubject;
    private List<String> studyStyle;
    private String nickname;
}
