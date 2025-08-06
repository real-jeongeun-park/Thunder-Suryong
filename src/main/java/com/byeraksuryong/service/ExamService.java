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
<<<<<<< HEAD
        List<Exam> previousExam = examRepository.findByDefaultExam(true);
        Exam newExam = examRepository.findByExamId(id).get(0);

        if(previousExam.isEmpty()){
            newExam.setDefaultExam(true);
            examRepository.save(newExam);
        }
        else{
            previousExam.get(0).setDefaultExam(false);
            newExam.setDefaultExam(true);
            examRepository.save(newExam);
        }
    }

    public void unsetDefaultExam(Map<String, String> body) {
        String nickname = body.get("nickname");
        List<Exam> exam = examRepository.findByNicknameAndDefaultExam(nickname, true);

        if (!exam.isEmpty()) {
            Exam trueExam = exam.get(0);
            trueExam.setDefaultExam(false);
            examRepository.save(trueExam);
        }
    }

    public Map<String, String> getExamByNickname(Map<String, String> body){
        String nickname = body.get("nickname");

        return examRepository.findByNicknameAndDefaultExam(nickname, true)
                .stream()
                .findFirst()
                .map(e -> {
                    Map<String, String> examInfo = new HashMap<>();
                    examInfo.put("name", e.getExamName());
                    examInfo.put("date", e.getStartDate().toString());
                    return examInfo;
                })
                .orElse(null);
=======
        Exam previousExam = examRepository.findByDefaultExam(true).get(0);
        Exam newExam = examRepository.findByExamId(id).get(0);

        if(previousExam.equals(newExam)) return;

        previousExam.setDefaultExam(false);
        newExam.setDefaultExam(true);
        examRepository.save(newExam);
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
    }
}
