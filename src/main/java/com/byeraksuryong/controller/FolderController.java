package com.byeraksuryong.controller;

import com.byeraksuryong.domain.Folder;
import com.byeraksuryong.dto.FolderRequest;
import com.byeraksuryong.dto.Response;
import com.byeraksuryong.service.FolderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RequestMapping("/api")
@RestController
public class FolderController {
    private final FolderService folderService;

    public FolderController(FolderService folderService){
        this.folderService = folderService;
    }

    // 생성
    @PostMapping("/createFolder")
    public ResponseEntity<?> receiveFolderName(@RequestBody FolderRequest folderRequest){
        try{
            folderService.createFolder(folderRequest);
            return ResponseEntity.ok(true);
        } catch(Exception err){
            System.out.println(err.getMessage());
            return ResponseEntity.status(404).body(err.getMessage());
        }
    }

    // 출력
    @PostMapping("/printFolder")
    public ResponseEntity<?> printFolderName(@RequestBody Map<String, String> body){
        String nickname = body.get("nickname");
        try{
            List<Map<String, String>> res = folderService.getFolders(nickname);
            return ResponseEntity.ok(res);
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping("/printFolderById")
    public ResponseEntity<?> printFolderById(@RequestBody Map<String, String> body){
        try{
            String name = folderService.getFolderNameById(body);
            return ResponseEntity.ok(name);
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}