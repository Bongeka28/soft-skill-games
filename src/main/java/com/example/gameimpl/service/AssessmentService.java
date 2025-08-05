package com.example.gameimpl.service;

import com.example.gameimpl.model.Assessment;
import com.example.gameimpl.repository.AssessmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AssessmentService {

    @Autowired
    private AssessmentRepository assessmentRepository;

    public List<Assessment> getAllAssessments() {
        return assessmentRepository.findAll();
    }

    public Optional<Assessment> getAssessmentById(Integer id) {
        return assessmentRepository.findById(id);
    }

    public List<Assessment> getAssessmentsByCandidateId(Integer candidateId) {
        return assessmentRepository.findByCandidateId(candidateId);
    }

    public List<Assessment> getAssessmentsByHrId(Integer hrId) {
        return assessmentRepository.findByHrId(hrId);
    }

    public List<Assessment> getAssessmentsByStatus(String status) {
        return assessmentRepository.findByStatus(status);
    }

    public Assessment saveAssessment(Assessment assessment) {
        return assessmentRepository.save(assessment);
    }

    public void deleteAssessment(Integer id) {
        assessmentRepository.deleteById(id);
    }
}
