package com.byeraksuryong.service;

import com.byeraksuryong.domain.Exam;
import com.byeraksuryong.domain.Plan;
import com.byeraksuryong.dto.SubjectInfosList;
import com.byeraksuryong.repository.ExamRepository;
import com.byeraksuryong.repository.PlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PlanService {
    private final PlanRepository planRepository;
    private final ExamRepository examRepository;

    @Autowired
    public PlanService(PlanRepository planRepository, ExamRepository examRepository){
        this.planRepository = planRepository;
        this.examRepository = examRepository;
    }

    public boolean createPlans(SubjectInfosList list, String nickname){
        for(int i = 0; i < list.getDate().size(); i++){
            Plan plan = new Plan();
            plan.setWeek(list.getWeek().get(i));
            plan.setContent(list.getContent().get(i));
            plan.setDate(list.getDate().get(i)); // 공부 계획일
            plan.setLearned(false);

            String subject = list.getSubject().get(i);

            List<Exam> exams = examRepository.findByNicknameAndSubject(nickname, subject);
            if (exams == null || exams.isEmpty()) {
                return false;
            }
            Long exam_id = exams.get(0).getId();
            plan.setExamId(exam_id);

            try{
                planRepository.save(plan);
            } catch(Exception e){
                System.out.println(e.getMessage());
                return false;
            }
        }

        return true;
    }
}
