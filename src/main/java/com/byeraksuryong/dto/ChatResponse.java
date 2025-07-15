package com.byeraksuryong.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ChatResponse {
    public Choice[] choices;

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Choice{
        public Message message;  // static
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Message {
        public String role;
        public String content;
    }
}