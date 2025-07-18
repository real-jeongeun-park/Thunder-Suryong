package com.byeraksuryong.service;

import com.google.cloud.vision.v1.*;
import com.google.protobuf.ByteString;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Collections;

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
}