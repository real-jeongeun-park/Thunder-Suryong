package com.byeraksuryong.service;

import com.byeraksuryong.domain.Exam;
import com.byeraksuryong.repository.ExamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
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

    public Exam createExam(Map<String, String> body){
        String key = UUID.randomUUID().toString();
        String nickname = body.get("nickname");
        String startDate = body.get("startDate");
        String endDate = body.get("endDate");
        String examName = body.get("examName");

        List<Exam> previousDefaultList = examRepository.findByNicknameAndDefaultExam(nickname, true);
        previousDefaultList.forEach(exam -> exam.setDefaultExam(false));

        Exam newExam = new Exam();
        newExam.setExamId(key);
        newExam.setNickname(nickname);
        newExam.setStartDate(startDate);
        newExam.setEndDate(endDate);
        newExam.setExamName(examName);
        newExam.setDefaultExam(true);

        return examRepository.save(newExam);
    }
}
