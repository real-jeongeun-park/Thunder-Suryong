package com.byeraksuryong.domain;

import jakarta.persistence.*;
import lombok.Getter; import lombok.Setter;

@Entity @Table(name = "SURYONG")
@Getter @Setter
public class Suryong {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "species_code", nullable = false)
    private String speciesCode;            // 'water' | 'grass' | 'electric'

    @Column(nullable = false)
    private Integer bucket;

    @Column(name = "asset_key", nullable = false)
    private String assetKey;               // URL 또는 번들 리소스 키
}
