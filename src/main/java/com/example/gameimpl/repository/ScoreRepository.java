package com.example.gameimpl.repository;

import com.example.gameimpl.model.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Integer> {
    Optional<Score> findByAssessmentId(Integer assessmentId);
    List<Score> findByCandidateId(Integer candidateId);

}
