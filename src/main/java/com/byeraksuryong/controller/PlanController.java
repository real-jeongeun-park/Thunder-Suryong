package com.byeraksuryong.controller;

import com.byeraksuryong.dto.PlanRequest;
import com.byeraksuryong.dto.Response;
import com.byeraksuryong.dto.SubjectInfosList;
import com.byeraksuryong.service.PlanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PlanController {
    private final PlanService planService;

    public PlanController(PlanService planService){
        this.planService = planService;
    }

    @PostMapping("/api/createPlan")
    public ResponseEntity<?> receivePlans(@RequestBody PlanRequest planRequest){
        try{
            planService.createPlans(planRequest.getPlans(), planRequest.getNickname());
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        }
        return ResponseEntity.ok(true);
    }
}
