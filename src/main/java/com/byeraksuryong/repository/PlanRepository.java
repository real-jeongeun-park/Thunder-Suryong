package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Exam;
import com.byeraksuryong.domain.Plan;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanRepository {
    Plan save(Plan plan);
}
