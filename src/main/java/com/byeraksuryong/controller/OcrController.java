package com.byeraksuryong.controller;
import com.byeraksuryong.service.OcrService;
import com.google.protobuf.ByteString;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@RequestMapping("/api/ocr")
@RestController
public class OcrController {
    final private OcrService ocrService;

    public OcrController(OcrService ocrService){
        this.ocrService = ocrService;
    }

    @PostMapping("/app")
    public ResponseEntity<Object> handleOcr(@RequestParam("image") MultipartFile file){
        // 앱에서 실행
        try{
            ByteString imgBytes = ByteString.readFrom(file.getInputStream());
            String result = ocrService.useOcr(imgBytes);
            return ResponseEntity.ok(result);
        } catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/web")
    // 웹에서 실행
    public ResponseEntity<Object> handleOcrBase64(@RequestBody Map<String, String> body) {
        String base64 = body.get("base64");

        if (base64 == null || base64.isBlank()) {
            return ResponseEntity.badRequest().body("데이터 없음");
        }

        try {
            byte[] bytes = Base64.getDecoder().decode(base64);
            ByteString imgBytes = ByteString.copyFrom(bytes);
            String result = ocrService.useOcr(imgBytes);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
