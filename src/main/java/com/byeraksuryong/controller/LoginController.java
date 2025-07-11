package com.byeraksuryong.controller;

import com.byeraksuryong.api.JwtTokenProvider;
import com.byeraksuryong.dto.LoginInfo;
import com.byeraksuryong.service.LoginService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RequestMapping("/api")
@RestController
public class LoginController {
    private final JwtTokenProvider jwtTokenProvider;

    private final LoginService loginService;

    public LoginController(LoginService loginService, JwtTokenProvider jwtTokenProvider){
        this.loginService = loginService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginInfo loginInfo){
        boolean loginSuccess = loginService.login(loginInfo);
        if(loginSuccess){
            // 성공 시
            String token = jwtTokenProvider.createToken(loginInfo.getEmail(), List.of("ROLE_USER"));
            return ResponseEntity.ok(Collections.singletonMap("token", token));
        }
        else return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("error occurred");
    }
}
