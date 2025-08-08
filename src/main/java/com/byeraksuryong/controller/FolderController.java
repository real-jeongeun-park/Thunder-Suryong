package com.byeraksuryong.controller;

import com.byeraksuryong.dto.FolderRequest;
import com.byeraksuryong.service.FolderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RequestMapping("/api/folder")
@RestController
public class FolderController {
    private final FolderService folderService;

    public FolderController(FolderService folderService){
        this.folderService = folderService;
    }

    // 생성
    @PostMapping("/create")
    public ResponseEntity<?> receiveFolderName(@RequestBody FolderRequest folderRequest){
        try{
            return ResponseEntity.ok(folderService.createFolder(folderRequest));
        } catch(Exception err){
            System.out.println(err.getMessage());
            return ResponseEntity.status(500).body(err.getMessage());
        }
    }

    // 출력
    @PostMapping("/get")
    public ResponseEntity<?> printFolderName(@RequestBody Map<String, String> body){
        try{
            return ResponseEntity.ok(folderService.getFolders(body));
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/getById")
    public ResponseEntity<?> printFolderById(@RequestBody Map<String, String> body){
        try{
            return ResponseEntity.ok(folderService.getFolderNameById(body));
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/getFolderAndNote")
    public ResponseEntity<?> getEach(@RequestBody Map<String, String> body){
        try{
            return ResponseEntity.ok(folderService.getFoldersAndNotes(body));
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}