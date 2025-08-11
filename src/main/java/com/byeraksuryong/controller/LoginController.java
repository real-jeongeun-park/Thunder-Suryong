package com.byeraksuryong.controller;

import com.byeraksuryong.api.JwtTokenProvider;
import com.byeraksuryong.domain.Member;
import com.byeraksuryong.dto.LoginInfo;
import com.byeraksuryong.repository.MemberRepository;
import com.byeraksuryong.service.LoginService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RequestMapping("/api")
@RestController
public class LoginController {
    private final JwtTokenProvider jwtTokenProvider;

    private final LoginService loginService;
    private final MemberRepository memberRepository;

    public LoginController(LoginService loginService, JwtTokenProvider jwtTokenProvider, MemberRepository memberRepository) {
        this.loginService = loginService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.memberRepository = memberRepository;
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

    //비밀번호 변경
    @PostMapping("/member/changePassword")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body, Principal principal) {
        String email = principal.getName(); // 로그인된 사용자 이메일
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        Optional<Member> optionalMember = memberRepository.findByEmail(email);

        if (optionalMember.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("사용자를 찾을 수 없습니다.");
        }

        Member member = optionalMember.get();

        if (!member.getPassword().equals(currentPassword)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("현재 비밀번호가 일치하지 않습니다.");
        }

        member.setPassword(newPassword);
        memberRepository.save(member);

        return ResponseEntity.ok("비밀번호가 변경되었습니다.");
    }

    //회원탈퇴
    @DeleteMapping("/member/withdraw")
    public ResponseEntity<?> withdraw(Principal principal) {
        String email = principal.getName();  // 로그인된 사용자 이메일
        Optional<Member> optionalMember = memberRepository.findByEmail(email);

        if (optionalMember.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("회원이 존재하지 않습니다.");
        }

        Member member = optionalMember.get();
        memberRepository.delete(member);
        return ResponseEntity.ok("회원탈퇴 완료");
    }
}
