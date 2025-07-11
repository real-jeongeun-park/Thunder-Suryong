package com.byeraksuryong.repository;

import org.springframework.stereotype.Repository;

@Repository
public interface LoginRepository {
    boolean existsByEmailAndPassword(String email, String password);
}
