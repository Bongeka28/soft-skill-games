package com.example.gameimpl.service;

import com.example.gameimpl.model.Score;
import com.example.gameimpl.repository.ScoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ScoreService {
    @Autowired
    private ScoreRepository scoreRepository;

    public List<Score> getAllScores() {
        return scoreRepository.findAll();
    }

    public Optional<Score> getScoreById(Integer id) {
        return scoreRepository.findById(id);
    }

    public Optional<Score> getScoreByAssessmentId(Integer assessmentId) {
        return scoreRepository.findByAssessmentId(assessmentId);
    }

    public List<Score> getScoresByCandidateId(Integer candidateId) {
        return scoreRepository.findByCandidateId(candidateId);
    }

    public Score saveScore(Score score) {
        return scoreRepository.save(score);
    }

    public void deleteScore(Integer id) {
        scoreRepository.deleteById(id);
    }
}
