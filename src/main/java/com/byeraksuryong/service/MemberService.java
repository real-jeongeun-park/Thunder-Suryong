package com.byeraksuryong.service;

import com.byeraksuryong.domain.Member;
import com.byeraksuryong.dto.LoginInfo;
import com.byeraksuryong.repository.LoginRepository;
import com.byeraksuryong.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@Transactional
public class MemberService {
    private final MemberRepository memberRepository;

    @Autowired
    public MemberService(MemberRepository memberRepository){
        this.memberRepository = memberRepository;
    }

    public void changeSuryong(Map<String, String> body){
        String nickname = body.get("nickname");
        String suryongName = body.get("suryongName");

        Member member = memberRepository.findByNickname(nickname)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("no member found"));

        member.setSuryong(suryongName);
        memberRepository.save(member);
    }
    public String getSuryongByNickname(Map<String, String> body){
        String nickname = body.get("nickname");

        Member member = memberRepository.findByNickname(nickname)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("no member found"));

        return member.getSuryong();
    }

    public void changeSuryongName(Map<String, String> body){
        String nickname = body.get("nickname");
        String suryong = body.get("suryong");

        Member member = memberRepository.findByNickname(nickname)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("no member found"));

        member.setSuryong(suryong);
        memberRepository.save(member);
    }
}
