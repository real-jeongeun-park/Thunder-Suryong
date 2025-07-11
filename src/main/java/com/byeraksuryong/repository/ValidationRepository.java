package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Member;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ValidationRepository {
    boolean existsByEmail(String email);
    Optional<Member> findByEmail(String email);
}
