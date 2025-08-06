package com.byeraksuryong.service;

import com.byeraksuryong.domain.Exam;
import com.byeraksuryong.domain.Subject;
import com.byeraksuryong.domain.TotalTime;
import com.byeraksuryong.domain.TotalTimeRequest;
import com.byeraksuryong.repository.ExamRepository;
import com.byeraksuryong.repository.SubjectRepository;
import com.byeraksuryong.repository.TotalTimeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Transactional
@Service
public class TotalTimeService {
    private final TotalTimeRepository totalTimeRepository;
    private final ExamRepository examRepository;
    private final SubjectRepository subjectRepository;

    @Autowired
    public TotalTimeService(TotalTimeRepository totalTimeRepository, ExamRepository examRepository, SubjectRepository subjectRepository) {
        this.totalTimeRepository = totalTimeRepository;
        this.examRepository = examRepository;
        this.subjectRepository = subjectRepository;
    }

    public void create(TotalTimeRequest totalTimeRequest){
        String subjectId = totalTimeRequest.getSubjectId();
        LocalDate date = totalTimeRequest.getDate();
        String totalTime = totalTimeRequest.getTotalTime();

        totalTimeRepository.findFirstBySubjectIdAndDate(subjectId, date)
                .ifPresentOrElse(
                        existing -> {
                            existing.setTotal(totalTime); // 업데이트
                            totalTimeRepository.save(existing);
                            },
                        () -> {
                            TotalTime newTotal = new TotalTime();
                            newTotal.setSubjectId(subjectId);
                            newTotal.setDate(date);
                            newTotal.setTotal(totalTime);
                            totalTimeRepository.save(newTotal);
                        }
                );
    }

    public List<String> getTotals(Map<String, Object> body){
        List<String> subjectIdList = (List<String>)body.get("subjectIdList");
        LocalDate date = LocalDate.parse((String)body.get("date"));

        List<String> totalList = new ArrayList<>();

        subjectIdList.forEach(id -> {
            totalTimeRepository.findFirstBySubjectIdAndDate(id, date)
                    .ifPresentOrElse(
                            existing -> {
                                totalList.add(existing.getTotal());
                                },
                            () -> {
                                totalList.add("00:00:00");
                            });
        });

        return totalList;
    }

    // String에서 Duration으로 형식 바꾸기
    private Duration parseHHMMSS(String timeString) {
        String[] parts = timeString.split(":");
        int hours = Integer.parseInt(parts[0]);
        int minutes = Integer.parseInt(parts[1]);
        int seconds = Integer.parseInt(parts[2]);
        return Duration.ofHours(hours).plusMinutes(minutes).plusSeconds(seconds);
    }

    public Map<LocalDate, String> getTotalsByMonth(Map<String, Object> body){
        String nickname = (String)body.get("nickname");
        YearMonth month = YearMonth.parse((String)body.get("month"));

        List<Exam> examList = examRepository.findByNicknameAndDefaultExam(nickname, true);
        if(examList.isEmpty()) return null;

        Exam exam = examList.get(0);

        List<String> subjectIdList = subjectRepository.findByExamId(exam.getExamId())
                .stream()
                .map(Subject::getSubjectId)
                .collect(Collectors.toList());

        List<TotalTime> totalTimeList = totalTimeRepository.findTotalsBySubjectIdsAndMonth(subjectIdList, month.atDay(1), month.atEndOfMonth());
        if(totalTimeList.isEmpty()) return null;

        Map<LocalDate, Duration> durationMap = new HashMap<>();

        for(TotalTime t : totalTimeList){
            if(t.getTotal() == null || t.getTotal().isEmpty()) continue;

            LocalDate date = t.getDate();
            Duration current = durationMap.getOrDefault(date, Duration.ZERO); // 현재 total 시간 불러옴

            Duration toAdd = parseHHMMSS(t.getTotal()); // ← 여기를 바꿈
            durationMap.put(date, current.plus(toAdd));
        }

        Map<LocalDate, String> result = new HashMap<>();
        for(Map.Entry<LocalDate, Duration> entry : durationMap.entrySet()){
            Duration d = entry.getValue();
            long hours = d.toHours();
            long minutes = (d.toMinutes() % 60);
            long seconds = (d.getSeconds() % 60);

            String formatted = String.format("%02d:%02d:%02d", hours, minutes, seconds);
            result.put(entry.getKey(), formatted);
        }

        return result;
    }
}