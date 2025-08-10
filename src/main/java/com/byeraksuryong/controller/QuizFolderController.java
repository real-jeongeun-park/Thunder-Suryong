package com.byeraksuryong.controller;

import com.byeraksuryong.dto.FolderRequest;
import com.byeraksuryong.service.FolderService;
import com.byeraksuryong.service.QuizFolderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RequestMapping("/api/quizFolder")
@RestController
public class QuizFolderController {
    private final QuizFolderService quizFolderService;

    public QuizFolderController(QuizFolderService quizFolderService){
        this.quizFolderService = quizFolderService;
    }

    // 생성
    @PostMapping("/create")
    public ResponseEntity<?> receiveFolderName(@RequestBody FolderRequest folderRequest){
        try{
            return ResponseEntity.ok(quizFolderService.createFolder(folderRequest));
        } catch(Exception err){
            System.out.println(err.getMessage());
            return ResponseEntity.status(500).body(err.getMessage());
        }
    }

    // 출력
    @PostMapping("/get")
    public ResponseEntity<?> printFolderName(@RequestBody Map<String, String> body){
        try{
            return ResponseEntity.ok(quizFolderService.getFolders(body));
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/getByFolderId")
    public ResponseEntity<?> getFolderById(@RequestBody Map<String, String> body){
        try{
            return ResponseEntity.ok(quizFolderService.getFolderNameById(body));
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}