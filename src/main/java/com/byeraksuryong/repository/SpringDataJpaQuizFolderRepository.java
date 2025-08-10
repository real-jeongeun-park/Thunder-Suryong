package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Folder;
import com.byeraksuryong.domain.QuizFolder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataJpaQuizFolderRepository extends JpaRepository<QuizFolder, Long>, QuizFolderRepository {
}
