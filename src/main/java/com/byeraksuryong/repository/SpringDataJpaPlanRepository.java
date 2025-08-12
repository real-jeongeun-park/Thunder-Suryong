package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface SpringDataJpaPlanRepository
        extends JpaRepository<Plan, Long>, PlanRepository {

    // ✅ 분모: 시험의 전체 계획 수(미래 포함)
    @Override
    @Query(value = """
        SELECT COUNT(*)
        FROM PLAN p
        JOIN SUBJECT s ON p.SUBJECT_ID = s.SUBJECT_ID
        JOIN EXAM    e ON s.EXAM_ID    = e.EXAM_ID
        WHERE s.EXAM_ID = :examId
          AND e.NICKNAME = :nickname
    """, nativeQuery = true)
    int countTotalByExamAll(@Param("examId") String examId,
                            @Param("nickname") String nickname);

    // ✅ 분자: 오늘까지(<= :date) 완료 수
    @Override
    @Query(value = """
        SELECT COUNT(*)
        FROM PLAN p
        JOIN SUBJECT s ON p.SUBJECT_ID = s.SUBJECT_ID
        JOIN EXAM    e ON s.EXAM_ID    = e.EXAM_ID
        WHERE s.EXAM_ID = :examId
          AND e.NICKNAME = :nickname
          AND p.DATE <= :date
          AND p.LEARNED = TRUE
    """, nativeQuery = true)
    int countLearnedByExamUpTo(@Param("examId") String examId,
                               @Param("nickname") String nickname,
                               @Param("date") LocalDate date);

    // ✅ 분모: 닉네임 전체 계획 수(모든 시험, 미래 포함)
    @Override
    @Query(value = """
        SELECT COUNT(*)
        FROM PLAN p
        JOIN SUBJECT s ON p.SUBJECT_ID = s.SUBJECT_ID
        JOIN EXAM    e ON s.EXAM_ID    = e.EXAM_ID
        WHERE e.NICKNAME = :nickname
    """, nativeQuery = true)
    int countTotalByNicknameAll(@Param("nickname") String nickname);

    // ✅ 분자: 오늘까지(<= :date) 완료 수
    @Override
    @Query(value = """
        SELECT COUNT(*)
        FROM PLAN p
        JOIN SUBJECT s ON p.SUBJECT_ID = s.SUBJECT_ID
        JOIN EXAM    e ON s.EXAM_ID    = e.EXAM_ID
        WHERE e.NICKNAME = :nickname
          AND p.DATE <= :date
          AND p.LEARNED = TRUE
    """, nativeQuery = true)
    int countLearnedByNicknameUpTo(@Param("nickname") String nickname,
                                   @Param("date") LocalDate date);
}
