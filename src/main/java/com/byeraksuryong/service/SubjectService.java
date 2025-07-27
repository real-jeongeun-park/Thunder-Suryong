package com.byeraksuryong.service;

import com.byeraksuryong.domain.Subject;
import com.byeraksuryong.dto.SubjectRequest;
import com.byeraksuryong.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Transactional
@Service
public class SubjectService {
    private final SubjectRepository subjectRepository;

    @Autowired
    public SubjectService(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    public void createSubject(SubjectRequest subjectRequest){
        String examId = subjectRequest.getExamId();
        List<String> subjects = subjectRequest.getSubjects();

        for(String subjectName : subjects){
            Subject newSubject = new Subject();
            newSubject.setExamId(examId);

            String key = UUID.randomUUID().toString();
            newSubject.setSubjectId(key);
            newSubject.setSubject(subjectName);
            subjectRepository.save(newSubject);
        }
    }
}
