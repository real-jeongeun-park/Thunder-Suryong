package com.byeraksuryong.domain;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class TotalTimeRequest {
    private String subjectId;
    private LocalDate date;
    private String totalTime;
}
