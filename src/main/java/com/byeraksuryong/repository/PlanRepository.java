package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PlanRepository extends JpaRepository<Plan, Long> {
    Plan save(Plan plan);
    List<Plan> findByDateAndExamId(LocalDate date, Long examId);
    Optional<Plan> findById(Long id);

    @Query("SELECT p FROM Plan p JOIN p.exam e WHERE p.date = :date AND e.nickname = :nickname")
    List<Plan> findByNicknameAndDate(@Param("nickname") String nickname, @Param("date") LocalDate date);
}

