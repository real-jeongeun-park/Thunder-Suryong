package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Folder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataJpaFolderRepository extends JpaRepository<Folder, Long>, FolderRepository {
}
