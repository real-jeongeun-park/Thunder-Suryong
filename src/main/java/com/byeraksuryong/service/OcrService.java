package com.byeraksuryong.service;

import com.byeraksuryong.api.AiApi;
import com.google.cloud.vision.v1.*;
import com.google.protobuf.ByteString;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
@Transactional
public class OcrService {
    public String useOcr(ByteString imgBytes) {
        try {
            Image img = Image.newBuilder().setContent(imgBytes).build();
            Feature feat = Feature.newBuilder().setType(Feature.Type.DOCUMENT_TEXT_DETECTION).build();
            AnnotateImageRequest request = AnnotateImageRequest.newBuilder()
                    .addFeatures(feat)
                    .setImage(img)
                    .build();

            try (ImageAnnotatorClient client = ImageAnnotatorClient.create()) {
                AnnotateImageResponse response = client.batchAnnotateImages(Collections.singletonList(request))
                        .getResponses(0);
                TextAnnotation annotation = response.getFullTextAnnotation();

                // System.out.println("annotation.getText() = " + annotation.getText());
                return annotation.getText();
            }

        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

    public List<String> useAi(String request){
        AiApi ai = new AiApi(1000);
        ai.setDefaultPrompt("다음 텍스트들 중 강의명으로 보이는 것들만 뽑아서 나열해줘\n" +
                "참고로 강의명이 끊기는 경우도 있기 때문에, 다른 줄의 단어와 연결해야 할 수도 있어: \n" +
                "응답은 '강의명1, 강의명2, 강의명3, 강의명4, ..., 강의명n' 로 간략하게 해줘.");
       try{
           String result = ai.requestAnswer(request).getResponse();
           List<String> subjectList = Arrays.stream(result.split(", "))
                   .map(String::trim)
                   .toList();

           return subjectList;
       } catch(Exception e){
           System.out.println(e.getMessage());
           return null;
       }
    }
}