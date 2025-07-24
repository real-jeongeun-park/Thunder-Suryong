package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Note;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataJpaNoteRepository extends JpaRepository<Note, Long>, NoteRepository {
}