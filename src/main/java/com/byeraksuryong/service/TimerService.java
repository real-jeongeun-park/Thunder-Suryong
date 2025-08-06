package com.byeraksuryong.service;

import com.byeraksuryong.domain.Timer;
import com.byeraksuryong.dto.TimerRequest;
import com.byeraksuryong.repository.TimerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@Service
public class TimerService {
    private final TimerRepository timerRepository;

    @Autowired
    public TimerService(TimerRepository timerRepository) {
        this.timerRepository = timerRepository;
    }

    public void create(TimerRequest timerRequest){
        Timer newTimer = new Timer();

        newTimer.setSubjectId(timerRequest.getSubjectId());
        newTimer.setDate(timerRequest.getDate());
        newTimer.setStartTime(timerRequest.getStartTime());
        newTimer.setEndTime(timerRequest.getEndTime());

        timerRepository.save(newTimer);
    }
}
