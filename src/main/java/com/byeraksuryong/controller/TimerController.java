package com.byeraksuryong.controller;

import com.byeraksuryong.dto.TimerRequest;
import com.byeraksuryong.service.TimerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/api/timer")
@RestController
public class TimerController {
    private final TimerService timerService;

    public TimerController(TimerService timerService){
        this.timerService = timerService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody TimerRequest timerRequest){
        try{
            timerService.create(timerRequest);
            return ResponseEntity.ok().build();
        } catch(Exception e){
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
