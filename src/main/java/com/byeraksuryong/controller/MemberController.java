package com.byeraksuryong.controller;
import com.byeraksuryong.service.MemberService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RequestMapping("/api/member")
@RestController
public class MemberController {
    private final MemberService memberService;

    public MemberController(MemberService memberService){
        this.memberService = memberService;
    }

    @PostMapping("/selectSuryong")
    public ResponseEntity<?> select(@RequestBody Map<String, String> body){
        try{
            memberService.changeSuryong(body);
            return ResponseEntity.ok().build();
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/getSuryong")
    public ResponseEntity<?> getName(@RequestBody Map<String, String> body){
        try{
            return ResponseEntity.ok(memberService.getSuryongByNickname(body));
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/changeSuryong")
    public ResponseEntity<?> changeName(@RequestBody Map<String, String> body){
        try{
            memberService.changeSuryongName(body);
            return ResponseEntity.ok().build();
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
