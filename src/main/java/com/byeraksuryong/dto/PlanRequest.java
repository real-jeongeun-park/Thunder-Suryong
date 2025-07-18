package com.byeraksuryong.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlanRequest {
    private SubjectInfosList plans;
    private String nickname;
}