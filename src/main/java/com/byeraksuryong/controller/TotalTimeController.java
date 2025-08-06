package com.byeraksuryong.controller;

import com.byeraksuryong.domain.TotalTimeRequest;
import com.byeraksuryong.dto.Response;
import com.byeraksuryong.dto.TimerRequest;
import com.byeraksuryong.service.TotalTimeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RequestMapping("/api/totalTime")
@RestController
public class TotalTimeController {
    private final TotalTimeService totalTimeService;

    public TotalTimeController(TotalTimeService totalTimeService){
        this.totalTimeService = totalTimeService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody TotalTimeRequest totalTimeRequest){
        try{
            totalTimeService.create(totalTimeRequest);
            return ResponseEntity.ok().build();
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/get")
    public ResponseEntity<?> get(@RequestBody Map<String, Object> body){
        try{
            return ResponseEntity.ok(totalTimeService.getTotals(body));
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/getByMonth")
    public ResponseEntity<?> getByMonth(@RequestBody Map<String, Object> body){
        try{
            return ResponseEntity.ok(totalTimeService.getTotalsByMonth(body));
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
