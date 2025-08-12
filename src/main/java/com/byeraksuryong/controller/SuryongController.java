package com.byeraksuryong.controller;

import com.byeraksuryong.service.SuryongService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/suryong")
@RequiredArgsConstructor
public class SuryongController {

    private final SuryongService suryongService;

    /* (A) 종 선택/변경 */
    @PostMapping("/select")
    public void select(@RequestBody SuryongService.SelectSpeciesRequest req) {
        suryongService.selectSpecies(req.nickname(), req.speciesCode(), req.examId());
    }

    /* (B) 상태 조회 (누적 % 기준 랜덤 에셋) */
    @GetMapping("/state")
    public SuryongService.SuryongStateDto state(@RequestParam String nickname,
                                                @RequestParam(required = false) String examId,
                                                @RequestParam(required = false)
                                                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                                                LocalDate date) {
        return suryongService.getState(nickname, examId, date);
    }

    // (필요할 때만) 기본 종 변경용
    @PostMapping("/select-default")
    public void selectDefault(@RequestBody SuryongService.SelectSpeciesRequest req) {
        suryongService.selectSpecies(req.nickname(), req.speciesCode(), null);
    }
}
