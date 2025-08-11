package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Folder;
import com.byeraksuryong.domain.QuizFolder;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizFolderRepository {
    QuizFolder save(QuizFolder quizFolder);
    List<QuizFolder> findByNicknameAndExamId(String nickname, String examId);
    List<QuizFolder> findByFolderId(String folderId);
    void deleteByFolderId(String folderId);
}
