package com.byeraksuryong.service;

import com.byeraksuryong.domain.Exam;
import com.byeraksuryong.repository.ExamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@Transactional
public class ExamService {
    private final ExamRepository examRepository;

    @Autowired
    public ExamService(ExamRepository examRepository){
        this.examRepository = examRepository;
    }

    public boolean createExam(Map<String, Object> body){
        String nickname = (String)body.get("nickname");

        Map<String, Object> list = (Map<String, Object>)body.get("list"); // 내부에 또 여러 개의 요소 존재
        String startDate = (String)list.get("startDate");
        String endDate = (String)list.get("endDate");
        String examName = (String)list.get("examName");
        List<String> subjectList = (List<String>)list.get("newSubjectList");

        try {
            for (String subject : subjectList) {
                Exam exam = new Exam(); // 새 객체!
                exam.setNickname(nickname);
                exam.setStartDate(startDate);
                exam.setEndDate(endDate);
                exam.setExamName(examName);
                exam.setSubject(subject);
                examRepository.save(exam); // 서로 다른 exam이 저장됨
            }
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return false;
        }
        return true;
    }
}
