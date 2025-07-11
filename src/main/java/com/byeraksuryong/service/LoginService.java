package com.byeraksuryong.service;

import com.byeraksuryong.dto.LoginInfo;
import com.byeraksuryong.repository.LoginRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Transactional
public class LoginService {
    private final LoginRepository loginRepository;

    @Autowired
    public LoginService(LoginRepository loginRepository){
        this.loginRepository = loginRepository;
    }

    public boolean login(LoginInfo loginInfo){
        return loginRepository.existsByEmailAndPassword(loginInfo.getEmail(), loginInfo.getPassword());
    }
}
