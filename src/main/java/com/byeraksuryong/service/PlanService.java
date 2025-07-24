package com.byeraksuryong.service;

import com.byeraksuryong.domain.Exam;
import com.byeraksuryong.domain.Plan;
import com.byeraksuryong.dto.SubjectInfosList;
import com.byeraksuryong.repository.ExamRepository;
import com.byeraksuryong.repository.SpringDataJpaPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.Optional;

import java.util.List;

@Service
@Transactional
public class PlanService {
    private final SpringDataJpaPlanRepository planRepository;
    private final ExamRepository examRepository;

    @Autowired
    public PlanService(SpringDataJpaPlanRepository planRepository, ExamRepository examRepository) {
        this.planRepository = planRepository;
        this.examRepository = examRepository;
    }

    public boolean createPlans(SubjectInfosList list, String nickname){
        for(int i = 0; i < list.getDate().size(); i++){
            Plan plan = new Plan();
            plan.setWeek(list.getWeek().get(i));
            plan.setContent(list.getContent().get(i));
            plan.setDate(LocalDate.parse(list.getDate().get(i))); // 공부 계획일
            plan.setLearned(false);

            String subject = list.getSubject().get(i);

            List<Exam> exams = examRepository.findByNicknameAndSubject(nickname, subject);
            if (exams == null || exams.isEmpty()) {
                return false;
            }
            Exam exam = exams.get(0);
            plan.setExam(exam);

            try{
                planRepository.save(plan);
            } catch(Exception e){
                System.out.println(e.getMessage());
                return false;
            }
        }

        return true;
    }

    public List<Plan> getTodayPlans(String nickname) {
        LocalDate today = LocalDate.now();
        return planRepository.findByNicknameAndDate(nickname, today);
    }


    public void updateLearnedStatus(Long planId, boolean learned, String nickname) {
        Optional<Plan> optionalPlan = planRepository.findById(planId);
        if (optionalPlan.isPresent()) {
            Plan plan = optionalPlan.get();

            // 본인의 Plan이 맞는지 확인
            Exam exam = plan.getExam();
            if (!exam.getNickname().equals(nickname)) {
                throw new SecurityException("다른 사용자의 계획을 수정할 수 없습니다.");
            }

            plan.setLearned(learned);
            planRepository.save(plan);
        } else {
            throw new IllegalArgumentException("해당 계획이 존재하지 않습니다.");
        }
    }

    public List<Plan> getPlansByDate(String nickname, String dateString) {
        LocalDate targetDate = LocalDate.parse(dateString);
        return planRepository.findByNicknameAndDate(nickname, targetDate);
    }
}
