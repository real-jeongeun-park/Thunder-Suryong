package com.byeraksuryong.repository;

import com.byeraksuryong.domain.TotalTime;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TotalTimeRepository {
    public TotalTime save(TotalTime totalTime);
    public Optional<TotalTime> findFirstBySubjectIdAndDate(String subjectId, LocalDate date);
    @Query("""
       SELECT t 
       FROM TotalTime t 
       WHERE t.subjectId IN :subjectIds 
       AND t.date BETWEEN :start AND :end
    """)
    List<TotalTime> findTotalsBySubjectIdsAndMonth(
       @Param("subjectIds") List<String> subjectIds,
       @Param("start") LocalDate start,
       @Param("end") LocalDate end
    );
}
