package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataJpaLoginRepository extends JpaRepository<Member, Long>, LoginRepository {
}
