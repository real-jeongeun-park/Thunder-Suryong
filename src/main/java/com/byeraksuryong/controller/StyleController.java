package com.byeraksuryong.controller;

import com.byeraksuryong.dto.StyleInfo;
import com.byeraksuryong.service.StyleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/api")
@RestController
public class StyleController {
    private final StyleService styleService;

    @Autowired
    public StyleController(StyleService styleService) {
        this.styleService = styleService;
    }

    @PostMapping("/style")
    public ResponseEntity<?> receiveStyle(@RequestBody StyleInfo styleInfo) {
        // 저장
        if (styleInfo == null) return ResponseEntity.ok(false);

        try {
            styleService.saveStyleInfo(styleInfo);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.ok(false);
        }

        return ResponseEntity.ok(true);
    }
}
