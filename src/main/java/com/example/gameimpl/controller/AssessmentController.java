package com.example.gameimpl.controller;

import com.example.gameimpl.model.Assessment;
import com.example.gameimpl.service.AssessmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/assessments")
@CrossOrigin(origins = "*")
public class AssessmentController {

    @Autowired
    private AssessmentService assessmentService;

    @GetMapping
    public List<Assessment> getAllAssessments() {
        return assessmentService.getAllAssessments();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Assessment> getAssessmentById(@PathVariable Integer id) {
        Optional<Assessment> assessment = assessmentService.getAssessmentById(id);
        return assessment.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/candidate/{candidateId}")
    public List<Assessment> getAssessmentsByCandidateId(@PathVariable Integer candidateId) {
        return assessmentService.getAssessmentsByCandidateId(candidateId);
    }

    @GetMapping("/hr/{hrId}")
    public List<Assessment> getAssessmentsByHrId(@PathVariable Integer hrId) {
        return assessmentService.getAssessmentsByHrId(hrId);
    }

    @GetMapping("/status/{status}")
    public List<Assessment> getAssessmentsByStatus(@PathVariable String status) {
        return assessmentService.getAssessmentsByStatus(status);
    }

    @PostMapping
    public Assessment createAssessment(@RequestBody Assessment assessment) {
        return assessmentService.saveAssessment(assessment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Assessment> updateAssessment(@PathVariable Integer id, @RequestBody Assessment assessment) {
        if (!assessmentService.getAssessmentById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        assessment.setId(id);
        return ResponseEntity.ok(assessmentService.saveAssessment(assessment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssessment(@PathVariable Integer id) {
        if (!assessmentService.getAssessmentById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        assessmentService.deleteAssessment(id);
        return ResponseEntity.noContent().build();
    }

}
