package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Timer;
import org.springframework.stereotype.Repository;

@Repository
public interface TimerRepository {
    Timer save(Timer timer);
}
