package com.byeraksuryong.service;

import com.byeraksuryong.domain.UserSuryongSelection;
import com.byeraksuryong.repository.PlanRepository;
import com.byeraksuryong.repository.SuryongRepository;
import com.byeraksuryong.repository.UserSuryongSelectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class SuryongService {

    private final PlanRepository planRepository;
    private final UserSuryongSelectionRepository selectionRepository;
    private final SuryongRepository suryongRepository;

    /**
     * 수룡 선택 (회원가입 직후 또는 변경)
     * examId가 null이면 회원가입 직후로 간주
     */
    @Transactional
    public void selectSpecies(String nickname, String speciesCode, String examId) {
        UserSuryongSelection sel;

        if (examId != null) {
            // examId 있는 경우 → 해당 시험 기준 선택
            sel = selectionRepository.findByNicknameAndExamId(nickname, examId).orElse(null);
        } else {
            // examId 없는 경우 → 회원가입 직후(기본 선택)
            sel = selectionRepository.findByNicknameAndExamIdIsNull(nickname).orElse(null);
        }

        if (sel == null) {
            sel = new UserSuryongSelection();
            sel.setNickname(nickname);
            sel.setExamId(examId); // null 허용
        }

        sel.setSpeciesCode(speciesCode);
        selectionRepository.save(sel);
    }

    /**
     * 상태 조회 (main 페이지)
     * examId/nickname/date 기반으로 '해당 날짜' 진행률 → 버킷 → 랜덤 에셋 계산
     */
    @Transactional(readOnly = true)
    public SuryongStateDto getState(String nickname, String examId, LocalDate date) {
        if (nickname == null || nickname.isBlank()) {
            throw new IllegalArgumentException("nickname is required");
        }
        LocalDate today = LocalDate.now(); // 항상 오늘 기준

        if (examId == null) {
            // ✅ 기본(회원가입 시) 선택 사용
            String species = resolveSpeciesOrDefault(nickname, null);

            int total   = planRepository.countTotalByNicknameAll(nickname);
            int learned = planRepository.countLearnedByNicknameUpTo(nickname, today);

            int progress = (total > 0) ? (int)Math.round(100.0 * learned / total) : 0;
            int bucket = toBucket(progress);

            String assetKey = suryongRepository.getRandomAssetKey(species, bucket);
            if (assetKey == null) {
                throw new IllegalStateException("카탈로그에 해당 종/버킷 에셋이 없습니다. (species=" + species + ", bucket=" + bucket + ")");
            }
            return new SuryongStateDto(null, species, progress, bucket, assetKey);
        }

        // ✅ 시험 기준 진행률
        int total   = planRepository.countTotalByExamAll(examId, nickname);
        int learned = planRepository.countLearnedByExamUpTo(examId, nickname, today);
        int progress = (total > 0) ? (int)Math.round(100.0 * learned / total) : 0;
        int bucket = toBucket(progress);

        // ✅ 없으면 기본(null)로 폴백
        String species = resolveSpeciesOrDefault(nickname, examId);

        String assetKey = suryongRepository.getRandomAssetKey(species, bucket);
        if (assetKey == null) {
            throw new IllegalStateException("카탈로그에 해당 종/버킷 에셋이 없습니다. (species=" + species + ", bucket=" + bucket + ")");
        }
        return new SuryongStateDto(examId, species, progress, bucket, assetKey);
    }


    private String resolveSpeciesOrDefault(String nickname, String examId) {
        if (examId == null) {
            return selectionRepository.findByNicknameAndExamIdIsNull(nickname)
                    .map(UserSuryongSelection::getSpeciesCode)
                    .orElseThrow(() -> new IllegalStateException("선택된 수룡 종이 없습니다. 먼저 입양(선택)하세요."));
        }
        // 시험별 선택이 없으면 기본(null) 선택으로 폴백
        return selectionRepository.findByNicknameAndExamId(nickname, examId)
                .map(UserSuryongSelection::getSpeciesCode)
                .orElseGet(() -> selectionRepository.findByNicknameAndExamIdIsNull(nickname)
                        .map(UserSuryongSelection::getSpeciesCode)
                        .orElseThrow(() -> new IllegalStateException("선택된 수룡 종이 없습니다. 먼저 입양(선택)하세요."))
                );
    }

    /* 버킷 규칙 */
    private int toBucket(int p) {
        if (p >= 67) return 100;   // 67~100% → 최종 단계(100)
        if (p >= 34) return 66;    // 34~66%  → 중간 단계(66)
        return 33;                 // 0~33%   → 초기 단계(33)
    }

    /* DTOs */
    public record SelectSpeciesRequest(String nickname, String speciesCode, String examId) {}
    public record SuryongStateDto(String examId, String speciesCode, int progressPercent, int bucket, String assetKey) {}
}
