package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataJpaExamRepository extends JpaRepository<Exam, Long>, ExamRepository {
}
