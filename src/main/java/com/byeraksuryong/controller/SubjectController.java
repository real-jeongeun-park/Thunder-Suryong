package com.byeraksuryong.controller;

<<<<<<< HEAD
<<<<<<< HEAD
import com.byeraksuryong.dto.Response;
=======
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
=======
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
import com.byeraksuryong.dto.SubjectRequest;
import com.byeraksuryong.service.SubjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
<<<<<<< HEAD
<<<<<<< HEAD
import java.util.Map;
=======
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
=======
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2

@RequestMapping("/api/subject")
@RestController
public class SubjectController {
    private final SubjectService subjectService;
    public SubjectController(SubjectService subjectService){
        this.subjectService = subjectService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> receiveSubjects(@RequestBody SubjectRequest subjectRequest){
        try{
            subjectService.createSubject(subjectRequest);
            return ResponseEntity.ok(true);
        } catch(Exception e){
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
<<<<<<< HEAD
<<<<<<< HEAD

    @PostMapping("/get")
    public ResponseEntity<?> getSubjects(@RequestBody Map<String, String> body){
        try{
            return ResponseEntity.ok(subjectService.getAllSubjects(body));
        } catch(Exception e){
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
=======
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
=======
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
}
