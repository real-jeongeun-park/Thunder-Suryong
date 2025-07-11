package com.byeraksuryong.service;

import com.byeraksuryong.domain.Member;
import com.byeraksuryong.repository.ValidationRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Transactional
public class ValidationService {
    private final ValidationRepository validationRepository;

    @Autowired
    public ValidationService(ValidationRepository validationRepository){
        this.validationRepository = validationRepository;
    }

    public boolean emailExist(String userId){
        return validationRepository.existsByEmail(userId);
    }

    public String findNickname(String email){
        // userId = email
        Optional<Member> member = validationRepository.findByEmail(email);
        if(member.isPresent()) return member.get().getNickname();
        else throw new IllegalStateException("error occurred");
    }
}
