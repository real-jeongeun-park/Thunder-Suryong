package com.byeraksuryong.api;
import com.byeraksuryong.dto.ChatRequest;
import com.byeraksuryong.dto.ChatResponse;
import com.byeraksuryong.dto.Response;
import com.byeraksuryong.dto.Message;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;

public class AiApi {
    private int maxTokens;
    private String prompt; // prompt = defaultPrompt

    public AiApi(int maxTokens){
        this.maxTokens = maxTokens;
    }

    public void setDefaultPrompt(String prompt){
        this.prompt = prompt;
    }

    public Response requestAnswer(String request) throws IOException, InterruptedException {
        if(!request.isEmpty()){
            // 비어있지 않으면
            ObjectMapper mapper = new ObjectMapper(); // 매핑. 리스트 -> 요청, 응답 -> 리스트 ???
            List<Message> messages = new ArrayList<>();

            if(prompt != null){
                // 추가로 명령할 내용 있음
                messages.add(new Message("user", prompt + request));
            }
            else{
                messages.add(new Message("user", request));
                // prompt 넣음. role은 user 고정
            }

            ChatRequest chatRequest = new ChatRequest("gpt-4o", messages, maxTokens); //  3.5 불러옴
            String requestBody = mapper.writeValueAsString(chatRequest); // message들 전부 string 형태

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                    .header("Content-Type", "application/json") // json 형태로 날림
                    .header("Authorization", "비공개")
                    // github에서 빼기
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build(); // 요청 보낼 곳 지정, 요청 content 타입 지정 -> json

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            // response body 값 받아옴

            if(response.statusCode() == 200){
                // OK
                ChatResponse chatResponse = mapper.readValue(response.body(), ChatResponse.class);
                // body 부분 받아서 chatResponse class 형태로 객체 생성
                Response userResponse = new Response();

                userResponse.setResponse(chatResponse.choices[0].message.content);
                // System.out.println("ChatGPT: " + answer.getAnswer());// 앞 뒤 공백 제거해 출력함
                // 위는 디버깅 부분
                return userResponse;
            }
            else{
                System.out.println(response.body());
                return null;
            }
        }
        else {
            return null;
        }
    }
}