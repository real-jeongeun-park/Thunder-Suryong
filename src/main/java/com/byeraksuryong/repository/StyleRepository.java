package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Style;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StyleRepository {
    Style save(Style style);
    List<Style> findByNickname(String nickname);
}
