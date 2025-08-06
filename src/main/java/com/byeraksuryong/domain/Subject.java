package com.byeraksuryong.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

<<<<<<< HEAD
<<<<<<< HEAD
import java.time.LocalDate;

=======
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
=======
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
@Entity
@Getter
@Setter
public class Subject {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "exam_id")
    private String examId;

    @Column(name = "subject_id")
    private String subjectId;
    private String subject;
<<<<<<< HEAD
<<<<<<< HEAD

    @Column(name = "exam_date")
    private LocalDate examDate;
=======
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
=======
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
}