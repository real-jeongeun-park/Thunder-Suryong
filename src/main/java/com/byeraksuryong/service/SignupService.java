package com.byeraksuryong.service;

import com.byeraksuryong.domain.Member;
import com.byeraksuryong.repository.SignupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class SignupService {
    private final SignupRepository signupRepository;

    @Autowired
    public SignupService(SignupRepository signUpRepository){
        this.signupRepository = signUpRepository;
    }

    public boolean nicknameExist(String nickname){
        return signupRepository.existsByNickname(nickname);
    }

    public boolean emailExist(String email) {
        return signupRepository.existsByEmail(email);
    }

    public void saveMember(Member member){
        try{
            signupRepository.save(member);
        } catch(Exception e){
            System.out.println(e.getMessage());
        }
    }

}
