package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Exam;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamRepository {
    Exam save(Exam exam);
    List<Exam> findByNicknameAndSubject(String nickname, String subject);
}
