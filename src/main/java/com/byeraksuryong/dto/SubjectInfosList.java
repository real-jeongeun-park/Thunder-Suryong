package com.byeraksuryong.dto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SubjectInfosList {
    private List<String> date;
    private List<String> subject;
    private List<String> week;
    private List<String> content;
}