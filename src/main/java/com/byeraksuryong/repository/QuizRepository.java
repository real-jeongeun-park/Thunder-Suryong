package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Quiz;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository {
    Quiz save(Quiz quiz);
    List<Quiz> findByNickname(String nickname);
}
