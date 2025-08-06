package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Timer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataJpaTimerRepository extends JpaRepository<Timer, Long>, TimerRepository{
}
