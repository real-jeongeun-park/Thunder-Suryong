package com.byeraksuryong.service;

import com.byeraksuryong.domain.Folder;
import com.byeraksuryong.dto.FolderRequest;
import com.byeraksuryong.repository.FolderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Transactional
@Service
public class FolderService {
    private final FolderRepository folderRepository;

    @Autowired
    public FolderService(FolderRepository folderRepository){
        this.folderRepository = folderRepository;
    }

    public Folder createFolder(FolderRequest folderRequest){
        Folder folder = new Folder();
        folder.setNickname(folderRequest.getNickname());
        folder.setFolderId(folderRequest.getFolderId());
        folder.setFolderName(folderRequest.getFolderName());
        return folderRepository.save(folder);
    }

    public List<Map<String, String>> getFolders(String nickname){
        return folderRepository.findByNickname(nickname)
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
}
