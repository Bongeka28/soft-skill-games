package com.example.gameimpl.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Score {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer scoreId;

    @Column(name = "assessment_id")
    private Integer assessmentId;

    @Column(name = "candidate_id")
    private Integer candidateId;

    private String score;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    private LocalDateTime completedAt;

    @Column(columnDefinition = "TEXT")
    private String gameData; // JSON string for game-specific data

    @PrePersist
    protected void onCreate() {
        this.completedAt = LocalDateTime.now();
    }
}
