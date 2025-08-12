package com.byeraksuryong.controller;

import com.byeraksuryong.dto.SubjectInfoList;
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

@RequestMapping("/api/plan")
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

    @PostMapping("/create")
    public ResponseEntity<?> receivePlans(@RequestBody SubjectInfoList subjectInfoList) {
        try {
            planService.createPlans(subjectInfoList);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        }
        return ResponseEntity.ok(true);
    }

    // 체크박스 상태 변경 API
    @PatchMapping("/{id}/learned")
    public ResponseEntity<?> updateLearnedStatus(@PathVariable("id") Long id, @RequestBody Map<String, Object> body) {
        try {
            planService.updateLearnedStatus(id, body);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PostMapping("/date")
    public ResponseEntity<?> getPlans(@RequestBody Map<String, String> body) {
        try{
            return ResponseEntity.ok(planService.getPlansByDate(body));
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping("/achievement")
    public ResponseEntity<?> getPlanNumber(@RequestBody Map<String, String> body){
        try{
            return ResponseEntity.ok(planService.getPlanNumber(body));
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping("/deleteByPlanId")
    public ResponseEntity<?> deleteByPlanId(@RequestBody Map<String, String> body){
        try{
            planService.deleteByPlanId(body);
            return ResponseEntity.ok().build();
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping("/changeDate")
    public ResponseEntity<?> changeDate(@RequestBody Map<String, String> body){
        try{
            planService.changeByDate(body);
            return ResponseEntity.ok().build();
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping("/changePlan")
    public ResponseEntity<?> changePlan(@RequestBody Map<String, String> body){
        try{
            planService.changePlan(body);
            return ResponseEntity.ok().build();
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping("/createOne")
    public ResponseEntity<?> createOne(@RequestBody Map<String, String> body){
        try{
            planService.createOnePlan(body);
            return ResponseEntity.ok().build();
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping("/getTotalRate")
    public ResponseEntity<?> getTotalRate(@RequestBody Map<String, String> body){
        try{
            return ResponseEntity.ok(planService.getTotalRate(body));
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}

