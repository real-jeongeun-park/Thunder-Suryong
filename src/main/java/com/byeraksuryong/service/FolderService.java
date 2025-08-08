package com.byeraksuryong.service;

import com.byeraksuryong.domain.Exam;
import com.byeraksuryong.domain.Folder;
import com.byeraksuryong.dto.FolderRequest;
import com.byeraksuryong.repository.ExamRepository;
import com.byeraksuryong.repository.FolderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Transactional
@Service
public class FolderService {
    private final FolderRepository folderRepository;
    private final ExamRepository examRepository;
    private final NoteService noteService;

    @Autowired
    public FolderService(FolderRepository folderRepository, ExamRepository examRepository, NoteService noteService){
        this.folderRepository = folderRepository;
        this.examRepository = examRepository;
        this.noteService = noteService;
    }

    public String createFolder(FolderRequest folderRequest){
        String nickname = folderRequest.getNickname();
        String folderName = folderRequest.getFolderName();

        Folder folder = new Folder();
        folder.setNickname(nickname);

        // exam id 불러오기
        String examId = examRepository.findByNicknameAndDefaultExam(nickname, true).get(0).getExamId();
        folder.setExamId(examId);

        String key = UUID.randomUUID().toString();
        folder.setFolderId(key);

        folder.setFolderName(folderRequest.getFolderName());

        return folderRepository.save(folder).getFolderId();
    }

    public List<Map<String, String>> getFolders(Map<String, String> body){
        String nickname = body.get("nickname");
        // 현재 exam id 가져옴
        String examId = examRepository.findByNicknameAndDefaultExam(nickname, true).get(0).getExamId();

        return folderRepository.findByNicknameAndExamId(nickname, examId)
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
        String id = body.get("id");
        List<Folder> folder = folderRepository.findByFolderId(id);
        return folder.get(0).getFolderName();
    }

    public List<Map<String, Object>> getFoldersAndNotes(Map<String, String> body){
        String nickname = body.get("nickname");
        String examId = examRepository.findByNicknameAndDefaultExam(nickname, true)
                .stream()
                .findFirst()
                .map(Exam::getExamId)
                .orElseThrow(() -> new RuntimeException("no exam found"));

        List<Folder> folders = folderRepository.findByExamId(examId)
                .orElseThrow(() -> new RuntimeException("no folder found"));

        List<String> folderIds = folders.
                stream()
                .map(Folder::getFolderId)
                .collect(Collectors.toList());

        List<String> folderNames = folders.
                stream()
                .map(Folder::getFolderName)
                .collect(Collectors.toList());

        List<Map<String, Object>> newList = new ArrayList<>();
        int i = 0;

        for(String folderName : folderNames){
            List<List<String>> noteInfoList = noteService.findByFolderId(folderIds.get(i));
            List<String> noteIds = noteInfoList.get(0);
            List<String> noteTitles = noteInfoList.get(1);

            Map<String, Object> newMap = new HashMap<>();
            newMap.put("folderName", folderName);
            newMap.put("folderId", folderIds.get(i));
            newMap.put("noteIds", noteIds);
            newMap.put("noteTitles", noteTitles);

            newList.add(newMap);
            i++;
        }

        return newList;
    }
}
