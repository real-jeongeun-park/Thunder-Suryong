package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Exam;
import com.byeraksuryong.domain.TotalTime;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataJpaTotalTimeRepository extends JpaRepository<TotalTime, Long>, TotalTimeRepository {
}
