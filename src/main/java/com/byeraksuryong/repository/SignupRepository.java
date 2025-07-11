package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Member;
import org.springframework.stereotype.Repository;

@Repository
public interface SignupRepository {
    boolean existsByEmail(String email);
    boolean existsByNickname(String nickname);
    Member save(Member member);
}
