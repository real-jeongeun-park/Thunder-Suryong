package com.byeraksuryong.service;

import com.byeraksuryong.domain.Subject;
import com.byeraksuryong.dto.SubjectRequest;
<<<<<<< HEAD
import com.byeraksuryong.repository.ExamRepository;
=======
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
import com.byeraksuryong.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

<<<<<<< HEAD
import java.time.LocalDate;
import java.util.*;
=======
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2

@Transactional
@Service
public class SubjectService {
    private final SubjectRepository subjectRepository;
<<<<<<< HEAD
    private final ExamRepository examRepository;

    @Autowired
    public SubjectService(SubjectRepository subjectRepository, ExamRepository examRepository) {
        this.subjectRepository = subjectRepository;
        this.examRepository = examRepository;
=======

    @Autowired
    public SubjectService(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
    }

    public void createSubject(SubjectRequest subjectRequest){
        String examId = subjectRequest.getExamId();
        List<String> subjects = subjectRequest.getSubjects();
<<<<<<< HEAD
        List<String> subjectDates = subjectRequest.getSubjectDates();

        for(int i = 0; i < subjects.size(); i++){
=======

        for(String subjectName : subjects){
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
            Subject newSubject = new Subject();
            newSubject.setExamId(examId);

            String key = UUID.randomUUID().toString();
            newSubject.setSubjectId(key);
<<<<<<< HEAD
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
=======
            newSubject.setSubject(subjectName);
            subjectRepository.save(newSubject);
        }
    }
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
}
