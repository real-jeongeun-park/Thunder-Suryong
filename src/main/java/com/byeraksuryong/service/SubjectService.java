package com.byeraksuryong.service;

import com.byeraksuryong.domain.Subject;
import com.byeraksuryong.dto.SubjectRequest;
import com.byeraksuryong.repository.ExamRepository;
import com.byeraksuryong.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Transactional
@Service
public class SubjectService {
    private final SubjectRepository subjectRepository;
    private final ExamRepository examRepository;

    @Autowired
    public SubjectService(SubjectRepository subjectRepository, ExamRepository examRepository) {
        this.subjectRepository = subjectRepository;
        this.examRepository = examRepository;
    }

    public void createSubject(SubjectRequest subjectRequest){
        String examId = subjectRequest.getExamId();
        List<String> subjects = subjectRequest.getSubjects();
        List<String> subjectDates = subjectRequest.getSubjectDates();

        for(int i = 0; i < subjects.size(); i++){
            Subject newSubject = new Subject();
            newSubject.setExamId(examId);

            String key = UUID.randomUUID().toString();
            newSubject.setSubjectId(key);
            newSubject.setSubject(subjects.get(i));

            LocalDate examDate = LocalDate.parse(subjectDates.get(i));
            newSubject.setExamDate(examDate);

            subjectRepository.save(newSubject);
        }
    }

    public Map<String, List<String>> getAllSubjects(Map<String, String> body){
        String nickname = body.get("nickname");

        List<String> subjectNameList = examRepository.findByNicknameAndDefaultExam(nickname, true)
                .stream()
                .findFirst()
                .map(exam ->
                        subjectRepository.findByExamId(exam.getExamId())
                                .stream()
                                .map(Subject::getSubject)
                                .toList()
                )
                .orElse(Collections.emptyList());

        List<String> subjectIdList = examRepository.findByNicknameAndDefaultExam(nickname, true)
                .stream()
                .findFirst()
                .map(exam ->
                        subjectRepository.findByExamId(exam.getExamId())
                                .stream()
                                .map(Subject::getSubjectId)
                                .toList()
                )
                .orElse(Collections.emptyList());

        Map<String, List<String>> map = new HashMap<>();
        map.put("subjectNameList", subjectNameList);
        map.put("subjectIdList", subjectIdList);

        return map;
    }
}
