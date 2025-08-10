package com.byeraksuryong.service;

import com.byeraksuryong.domain.Exam;
import com.byeraksuryong.domain.Folder;
import com.byeraksuryong.domain.QuizFolder;
import com.byeraksuryong.dto.FolderRequest;
import com.byeraksuryong.repository.ExamRepository;
import com.byeraksuryong.repository.FolderRepository;
import com.byeraksuryong.repository.QuizFolderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Transactional
@Service
public class QuizFolderService {
    private final QuizFolderRepository quizFolderRepository;
    private final ExamRepository examRepository;

    @Autowired
    public QuizFolderService(QuizFolderRepository quizFolderRepository, ExamRepository examRepository){
        this.quizFolderRepository = quizFolderRepository;
        this.examRepository = examRepository;
    }

    public String createFolder(FolderRequest folderRequest){
        String nickname = folderRequest.getNickname();
        String folderName = folderRequest.getFolderName();

        QuizFolder folder = new QuizFolder();
        folder.setNickname(nickname);

        // exam id 불러오기
        String examId = examRepository.findByNicknameAndDefaultExam(nickname, true).get(0).getExamId();
        folder.setExamId(examId);

        String key = UUID.randomUUID().toString();
        folder.setFolderId(key);

        folder.setFolderName(folderName);

        return quizFolderRepository.save(folder).getFolderId();
    }

    public List<Map<String, String>> getFolders(Map<String, String> body) {
        String nickname = body.get("nickname");
        String examId = examRepository.findByNicknameAndDefaultExam(nickname, true).get(0).getExamId();

        return quizFolderRepository.findByNicknameAndExamId(nickname, examId)
                .stream()
                .map(folder -> {
                    Map<String, String> map = new HashMap<>();
                    map.put("folderId", folder.getFolderId());
                    map.put("folderName", folder.getFolderName());
                    return map;
                })
                .collect(Collectors.toList());
    }

    public String getFolderNameById(Map<String, String> body){
        String folderId = body.get("folderId");
        return quizFolderRepository.findByFolderId(folderId)
                .stream()
                .findFirst()
                .map(QuizFolder::getFolderName)
                .orElseThrow(() -> new RuntimeException("no quiz folder found"));
    }
}
