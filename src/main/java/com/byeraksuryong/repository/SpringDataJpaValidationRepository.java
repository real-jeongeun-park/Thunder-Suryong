package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataJpaValidationRepository extends JpaRepository<Member, Long>, ValidationRepository {
}
