package com.byeraksuryong.service;

import com.byeraksuryong.domain.Exam;
import com.byeraksuryong.domain.Plan;
import com.byeraksuryong.domain.Subject;
import com.byeraksuryong.dto.SubjectInfoList;
import com.byeraksuryong.repository.ExamRepository;
import com.byeraksuryong.repository.PlanRepository;
import com.byeraksuryong.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;

import java.util.stream.Collectors;

@Service
@Transactional
public class PlanService {
    private final PlanRepository planRepository;
    private final ExamRepository examRepository;
    private final SubjectRepository subjectRepository;

    @Autowired
    public PlanService(PlanRepository planRepository, ExamRepository examRepository, SubjectRepository subjectRepository){
        this.planRepository = planRepository;
        this.examRepository = examRepository;
        this.subjectRepository = subjectRepository;
    }

    public boolean createPlans(SubjectInfoList list){
        int size = list.getSubject().size();
        try {
            for (int i = 0; i < size; i++) {
                Plan newPlan = new Plan();
                String subjectId = subjectRepository.findByExamIdAndSubject(list.getExamId(), list.getSubject().get(i)).get(0).getSubjectId();
                newPlan.setSubjectId(subjectId);
                newPlan.setWeek(list.getWeek().get(i));
                newPlan.setContent(list.getContent().get(i));
                newPlan.setDate(LocalDate.parse(list.getDate().get(i)));
                newPlan.setLearned(false);

                planRepository.save(newPlan);
            }
        } catch(Exception e){
            System.out.println(e.getMessage());
            return false;
        }
        return true;
    }

    public Map<String, List<Map<String, Object>>> getPlansByDate(Map<String, String> body){
        String nickname = (String)body.get("nickname");
        String stringDate = (String)body.get("date");
        LocalDate date = LocalDate.parse(stringDate);

        List<Exam> exam = examRepository.findByNicknameAndDefaultExam(nickname, true);

        if(exam.isEmpty()) return null;

        String examId = exam.get(0).getExamId();
        List<Subject> subjects = subjectRepository.findByExamId(examId);

        if(subjects.isEmpty()) return null;

        List<String> subjectIds = subjects.stream()
                .map(Subject::getSubjectId)
                .collect(Collectors.toList());

        List<Plan> plans = planRepository.findBySubjectIdInAndDate(subjectIds, date);

        Map<String, List<Map<String, Object>>> result = new LinkedHashMap<>();
        for(Plan plan : plans){
            String subject = subjectRepository.findBySubjectId(plan.getSubjectId()).get(0).getSubject();
            result.putIfAbsent(subject, new ArrayList<>());
            result.get(subject).add(Map.of(
                    "id", plan.getId(),
                    "week", plan.getWeek(),
                    "content", plan.getContent(),
                    "learned", plan.isLearned()
            ));
        }
        return result;
    }

    public void updateLearnedStatus(Long planId, Map<String, Object> body) {
        boolean learned = (boolean) body.get("learned");
        String nickname = (String) body.get("nickname");

        Optional<Plan> optionalPlan = planRepository.findById(planId);
        if (optionalPlan.isPresent()) {
            Plan plan = optionalPlan.get();

            // 본인의 plan이 맞는지 확인
            String subjectId = plan.getSubjectId();
            String examId = subjectRepository.findBySubjectId(subjectId).get(0).getExamId();
            String foundNickname = examRepository.findByExamId(examId).get(0).getNickname();

            if (!foundNickname.equals(nickname)) {
                throw new SecurityException("다른 사용자의 계획에 접근할 수 없습니다.");
            }

            plan.setLearned(learned);
            planRepository.save(plan); // 업데이트
        } else {
            throw new IllegalArgumentException("해당 계획이 존재하지 않습니다.");
        }
    }

    public double getPlanNumber(Map<String, String> body){
        String today = body.get("today");
        LocalDate date = LocalDate.parse(today);
        String nickname = body.get("nickname");

        // default exam인 경우만 불러옴
        List<Exam> exam = examRepository.findByNicknameAndDefaultExam(nickname, true);
        if(exam.isEmpty()) {
            return 0;
        }

        String examId = exam.get(0).getExamId(); // 현재 exam Id

        List<String> subjectIds = subjectRepository.findByExamId(examId)
                .stream()
                .map(Subject::getSubjectId)
                .collect(Collectors.toList());

        List<Plan> plans = planRepository.findBySubjectIdInAndDate(subjectIds, date);
        if(plans.isEmpty()){
            return 0;
        }

        int total = plans.size();
        double learned = (double)plans.stream()
                .filter(Plan::isLearned)
                .count();

        return learned/total * 100;
    }

    public void deleteByPlanId(Map<String, String> body){
        Long planId = Long.parseLong(body.get("planId"));
        planRepository.deleteById(planId);
    }

    public void changeByDate(Map<String, String> body){
        LocalDate date = LocalDate.parse(body.get("date"));
        Long planId = Long.parseLong(body.get("planId"));

        Plan plan = planRepository.findById(planId)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("no plan found"));

        plan.setDate(date);
        planRepository.save(plan);
    }

    public void changePlan(Map<String, String> body){
        Long planId = Long.parseLong(body.get("planId"));
        String week = body.get("week");
        String content = body.get("content");

        Plan plan = planRepository.findById(planId)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("no plan found"));

        plan.setWeek(week);
        plan.setContent(content);
        planRepository.save(plan);
    }

    public void createOnePlan(Map<String, String> body){
        String subjectId = body.get("subjectId");
        String week = body.get("week");
        String content = body.get("content");
        LocalDate date = LocalDate.parse(body.get("date"));

        Plan newPlan = new Plan();
        newPlan.setSubjectId(subjectId);
        newPlan.setWeek(week);
        newPlan.setContent(content);
        newPlan.setDate(date);
        newPlan.setLearned(false);

        planRepository.save(newPlan);
    }

    public double getTotalRate(Map<String, String> body){
        String nickname = body.get("nickname");

        List<Exam> exam = examRepository.findByNicknameAndDefaultExam(nickname, true);
        if(exam.isEmpty()) {
            return 0;
        }
        String examId = exam.get(0).getExamId(); // 현재 exam Id

        List<String> subjectIds = subjectRepository.findByExamId(examId)
                .stream()
                .map(Subject::getSubjectId)
                .collect(Collectors.toList());

        List<Plan> plans = planRepository.findBySubjectIdIn(subjectIds);
        if(plans.isEmpty()) return 0;

        int total = plans.size();
        double learned = (double)plans.stream()
                .filter(Plan::isLearned)
                .count();

        return learned/total * 100;
    }
}
