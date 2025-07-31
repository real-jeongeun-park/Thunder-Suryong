package com.byeraksuryong.service;

import com.byeraksuryong.domain.Exam;
import com.byeraksuryong.repository.ExamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

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

    public Map<String, Object> getExams(Map<String, String> body){
        String nickname = body.get("nickname");

        List<Exam> exams = examRepository.findByNickname(nickname);

        List<String> examIds = exams.stream()
                .map(Exam::getExamId)
                .collect(Collectors.toList());

        List<String> examNames = exams.stream()
                .map(Exam::getExamName)
                .collect(Collectors.toList());

        List<Boolean> defaultExams = exams.stream()
                .map(Exam::isDefaultExam)
                .collect(Collectors.toList());
        List<String> startDates = exams.stream()
            .map(Exam::getStartDate)
            .collect(Collectors.toList());

        Map<String, Object> examMap = new HashMap<>();
        examMap.put("examIds", examIds);
        examMap.put("examNames", examNames);
        examMap.put("defaultExams", defaultExams);
        examMap.put("startDates", startDates);

        return examMap;
    }

    public void changeDefaultExam(String id){
        Exam previousExam = examRepository.findByDefaultExam(true).get(0);
        Exam newExam = examRepository.findByExamId(id).get(0);

        if(previousExam.equals(newExam)) return;

        previousExam.setDefaultExam(false);
        newExam.setDefaultExam(true);
        examRepository.save(newExam);
    }
}
