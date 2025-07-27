package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Folder;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FolderRepository {
    Folder save(Folder folder);
    List<Folder> findByNickname(String nickname);
    List<Folder> findByFolderId(String folderId);
    List<Folder> findByNicknameAndExamId(String nickname, String examId);
}
