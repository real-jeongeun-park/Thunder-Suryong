package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Subject;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository {
    Subject save(Subject subject);
    List<Subject> findBySubject(String subject);
    List<Subject> findByExamId(String examId);
    List<Subject> findBySubjectId(String subjectId);
}