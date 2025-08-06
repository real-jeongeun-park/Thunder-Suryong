package com.byeraksuryong.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class TimerRequest {
    private String subjectId;
    private LocalDate date;
    private String startTime;
    private String endTime;
}
