package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Folder;
import com.byeraksuryong.domain.QuizFolder;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FolderRepository {
    Folder save(Folder folder);
    List<Folder> findByNickname(String nickname);
    List<Folder> findByFolderId(String folderId);
    List<Folder> findByNicknameAndExamId(String nickname, String examId);
    Optional<List<Folder>> findByExamId(String examId);
    List<Folder> findByFolderIdIn(List<String> folderIds);
    void deleteByFolderId(String folderId);
}
