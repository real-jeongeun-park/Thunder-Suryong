package com.byeraksuryong.repository;

import com.byeraksuryong.domain.UserSuryongSelection;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SpringDataJpaUserSuryongSelectionRepository
        extends JpaRepository<UserSuryongSelection, Long>, UserSuryongSelectionRepository {

    @Override
    Optional<UserSuryongSelection> findByNickname(String nickname);

    @Override
    Optional<UserSuryongSelection> findByNicknameAndExamId(String nickname, String examId);

    @Override
    Optional<UserSuryongSelection> findByNicknameAndExamIdIsNull(String nickname); // ✅ 추가
}

