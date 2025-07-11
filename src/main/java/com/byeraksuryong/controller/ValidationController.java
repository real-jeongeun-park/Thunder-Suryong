package com.byeraksuryong.controller;

import com.byeraksuryong.service.ValidationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RequestMapping("/api")
@RestController
public class ValidationController {
    private final ValidationService validationService;

    public ValidationController(ValidationService validationService){
        this.validationService = validationService;
    }

    @GetMapping("/validation")
    public ResponseEntity<?> getUserInfo(Authentication authentication){
        if(authentication == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("error occurred");
        }

        String userId = authentication.getName(); // 실제로는 email
        boolean success = validationService.emailExist(userId);

        if(success){
            // 일단 닉네임만
            Map<String, Object> userInfo = Map.of("nickname", validationService.findNickname(userId));
            return ResponseEntity.ok(userInfo);
        }
        else return ResponseEntity.ok(false); // false 전달
    }
}
