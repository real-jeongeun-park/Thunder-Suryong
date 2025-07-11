package com.byeraksuryong.repository;

import com.byeraksuryong.domain.Style;
import org.springframework.stereotype.Repository;

@Repository
public interface StyleRepository {
    Style save(Style style);
}
