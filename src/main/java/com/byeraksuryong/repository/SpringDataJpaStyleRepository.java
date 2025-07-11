package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Style;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataJpaStyleRepository extends JpaRepository<Style, Long>, StyleRepository {
}
