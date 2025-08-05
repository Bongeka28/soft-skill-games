package com.example.gameimpl.controller;


import com.example.gameimpl.model.Score;
import com.example.gameimpl.service.ScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/scores")
@CrossOrigin(origins = "*")
public class ScoreController {

    @Autowired
    private ScoreService scoreService;

    @GetMapping
    public List<Score> getAllScores() {
        return scoreService.getAllScores();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Score> getScoreById(@PathVariable Integer id) {
        Optional<Score> score = scoreService.getScoreById(id);
        return score.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/assessment/{assessmentId}")
    public ResponseEntity<Score> getScoreByAssessmentId(@PathVariable Integer assessmentId) {
        Optional<Score> score = scoreService.getScoreByAssessmentId(assessmentId);
        return score.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/candidate/{candidateId}")
    public List<Score> getScoresByCandidateId(@PathVariable Integer candidateId) {
        return scoreService.getScoresByCandidateId(candidateId);
    }

    @PostMapping
    public Score createScore(@RequestBody Score score) {
        return scoreService.saveScore(score);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Score> updateScore(@PathVariable Integer id, @RequestBody Score score) {
        if (!scoreService.getScoreById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        score.setScoreId(id);
        return ResponseEntity.ok(scoreService.saveScore(score));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteScore(@PathVariable Integer id) {
        if (!scoreService.getScoreById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        scoreService.deleteScore(id);
        return ResponseEntity.noContent().build();
    }
}
