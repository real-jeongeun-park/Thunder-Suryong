package com.byeraksuryong.service;

import com.byeraksuryong.domain.Style;
import com.byeraksuryong.dto.StyleInfo;
import com.byeraksuryong.repository.StyleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class StyleService {
    private final StyleRepository styleRepository;

    @Autowired
    public StyleService(StyleRepository styleRepository){
        this.styleRepository = styleRepository;
    }

    public void saveStyleInfo(StyleInfo styleInfo){
        List<String> styleList = styleInfo.getStudyStyle();
        String joinedStyle = String.join(", ", styleList);

        Style style = new Style();
        style.setNickname(styleInfo.getNickname());
        style.setStudyTime(styleInfo.getStudyTime());
        style.setStudySubject(styleInfo.getStudySubject());
        style.setStudyStyle(joinedStyle);

        try{
            styleRepository.save(style);
        } catch(Exception e){
            System.out.println(e.getMessage());
        }
    }
}
