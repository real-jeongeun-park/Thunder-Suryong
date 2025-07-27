package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Plan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataJpaPlanRepository extends JpaRepository<Plan, Long>, PlanRepository {
}
