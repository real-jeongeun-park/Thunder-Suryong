package com.byeraksuryong.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(
        name = "user_suryong_selection",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"nickname", "exam_id"})
        }
)
public class UserSuryongSelection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nickname", nullable = false)
    private String nickname; // 회원 식별용

    @Column(name = "exam_id", nullable = true)
    private String examId; // 회원가입 시 NULL 가능

    @Column(name = "species_code", nullable = false)
    private String speciesCode; // 수룡 종 코드
}

