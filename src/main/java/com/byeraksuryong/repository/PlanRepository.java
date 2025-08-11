package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Plan;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PlanRepository {
    Plan save(Plan plan);
    Optional<Plan> findById(Long id);
    List<Plan> findBySubjectIdInAndDate(List<String> subjectId, LocalDate date);
    void deleteById(Long id);
}

