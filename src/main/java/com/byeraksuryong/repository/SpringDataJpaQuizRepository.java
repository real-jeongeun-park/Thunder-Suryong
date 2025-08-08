package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataJpaQuizRepository extends JpaRepository<Quiz, Long>, QuizRepository {
}
