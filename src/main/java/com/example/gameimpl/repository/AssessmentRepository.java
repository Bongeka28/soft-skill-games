package com.example.gameimpl.repository;

import com.example.gameimpl.model.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Integer> {
    List<Assessment> findByCandidateId(Integer candidateId);
    List<Assessment> findByHrId(Integer hrId);
    List<Assessment> findByStatus(String status);

}
