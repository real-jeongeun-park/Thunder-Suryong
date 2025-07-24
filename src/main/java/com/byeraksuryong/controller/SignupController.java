package com.byeraksuryong.controller;
import com.byeraksuryong.api.JwtTokenProvider;
import com.byeraksuryong.domain.Member;
import com.byeraksuryong.service.PlanService;
import com.byeraksuryong.service.SignupService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RequestMapping("/api")
@RestController
public class SignupController {
    private final SignupService signUpService;
    private final JwtTokenProvider jwtTokenProvider;

    public SignupController(SignupService signUpService, JwtTokenProvider jwtTokenProvider){
        this.signUpService = signUpService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/nickname")
    public ResponseEntity<Boolean> checkNickname(@RequestBody Map<String, String> res){
        String nickname = res.get("nickname");
        boolean isNotExisting = !(signUpService.nicknameExist(nickname));
        return ResponseEntity.ok(isNotExisting); // 없으면 true 반환
    }

    @PostMapping("/email")
    public ResponseEntity<Boolean> checkEmail(@RequestBody Map<String, String> res){
        String email = res.get("email");
        boolean isNotExisting = !(signUpService.emailExist(email)); // 뒤집음
        // if(isNotExisting) System.out.println("ok");
        return ResponseEntity.ok(isNotExisting);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Member member){
        try{
            signUpService.saveMember(member);
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.ok(false);
        }

        String token = jwtTokenProvider.createToken(member.getEmail(), List.of("ROLE_USER"));
        return ResponseEntity.ok(Collections.singletonMap("token", token));
    }
}
