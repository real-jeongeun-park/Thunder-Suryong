package com.byeraksuryong.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Message {
    public String role;
    public String content;

    public Message(String role, String content){
        this.role = role;
        this.content = content;
    }
}