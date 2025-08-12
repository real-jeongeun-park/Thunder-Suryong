package com.byeraksuryong.repository;

import com.byeraksuryong.domain.UserSuryongSelection;
import java.util.Optional;

public interface UserSuryongSelectionRepository {

    Optional<UserSuryongSelection> findByNickname(String nickname);
    UserSuryongSelection save(UserSuryongSelection selection);

    Optional<UserSuryongSelection> findByNicknameAndExamId(String nickname, String examId);
    Optional<UserSuryongSelection> findByNicknameAndExamIdIsNull(String nickname);
}

