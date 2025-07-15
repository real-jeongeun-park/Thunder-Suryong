package com.byeraksuryong.dto;

import java.util.List;

public class ChatRequest {
    public String model;
    public List<Message> messages; // 메세지 여러 개
    public int max_tokens;

    public ChatRequest(String model, List<Message> messages, int max_tokens){
        this.model = model;
        this.messages = messages;
        this.max_tokens = max_tokens;
    }
}