package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Exam;
import com.byeraksuryong.domain.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataJpaSubjectRepository extends JpaRepository<Subject, Long>, SubjectRepository {
}
