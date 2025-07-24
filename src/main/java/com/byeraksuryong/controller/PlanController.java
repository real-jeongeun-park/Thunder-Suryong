package com.byeraksuryong.controller;

import com.byeraksuryong.dto.PlanRequest;
import com.byeraksuryong.repository.MemberRepository;
import com.byeraksuryong.service.PlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.byeraksuryong.domain.Plan;
import com.byeraksuryong.service.ExamService;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.*;

@RestController
public class PlanController {
    private final PlanService planService;
    private final ExamService examService; // 과목명 조회용 ExamService 주입

    @Autowired
    private MemberRepository memberRepository;

    public PlanController(PlanService planService, ExamService examService) {
        this.planService = planService;
        this.examService = examService;
    }

    @PostMapping("/api/createPlan")
    public ResponseEntity<?> receivePlans(@RequestBody PlanRequest planRequest) {
        try {
            planService.createPlans(planRequest.getPlans(), planRequest.getNickname());
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        }
        return ResponseEntity.ok(true);
    }

    // 오늘 날짜의 계획을 닉네임 기준으로 조회하는 API
    @GetMapping("/api/plans/today")
    public ResponseEntity<?> getTodayPlans() {
        // JWT 인증 필터를 통과한 사용자 정보 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        String nickname = memberRepository.findByEmail(email).get().getNickname();
        List<Plan> plans = planService.getTodayPlans(nickname);

        // 과목별로 Plan을 묶어서 Map으로 정리
        Map<String, List<Map<String, Object>>> result = new LinkedHashMap<>();
        for (Plan plan : plans) {
            String subject = plan.getExam().getSubject();
            result.putIfAbsent(subject, new ArrayList<>());
            result.get(subject).add(Map.of(
                    "id", plan.getId(),
                    "content", plan.getContent(),
                    "learned", plan.isLearned()
            ));
        }

        return ResponseEntity.ok(result);
    }

    // 체크박스 상태 변경 API
    @PatchMapping("/api/plans/{id}/learned")
    public ResponseEntity<?> updateLearnedStatus(@PathVariable("id") Long id, @RequestBody Map<String, Boolean> body) {
        try {
            boolean learned = body.get("learned");

            // JWT에서 nickname 꺼내기
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            String nickname = memberRepository.findByEmail(email).get().getNickname(); // 닉네임으로 변환


            // nickname도 같이 넘기기
            planService.updateLearnedStatus(id, learned, nickname);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @GetMapping("/api/plans/date")
    public ResponseEntity<?> getPlansByDate(@RequestParam("date") String date) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        String nickname = memberRepository.findByEmail(email).get().getNickname();
        List<Plan> plans = planService.getPlansByDate(nickname, date);

        Map<String, List<Map<String, Object>>> result = new LinkedHashMap<>();
        for (Plan plan : plans) {
            String subject = plan.getExam().getSubject();
            result.putIfAbsent(subject, new ArrayList<>());
            result.get(subject).add(Map.of(
                    "id", plan.getId(),
                    "content", plan.getContent(),
                    "learned", plan.isLearned()
            ));
        }

        return ResponseEntity.ok(result);
    }

}

