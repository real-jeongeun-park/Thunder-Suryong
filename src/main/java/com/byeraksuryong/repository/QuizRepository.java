package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Quiz;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository {
    Quiz save(Quiz quiz);
    List<Quiz> findByQuizId(String quizId);
    List<Quiz> findByFolderId(String folderId);
    void deleteByQuizId(String quizId);
}
