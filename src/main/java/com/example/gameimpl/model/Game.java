package com.example.gameimpl.model;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String gameName;

    @Column(nullable = false)
    private String gameDescription;

    @Column(nullable = false)
    private String skillName;

    @Column(nullable = false)
    private String gameUrl;

    @Column(nullable = false)
    private String gameImage;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean active;

    @Column(nullable = false)
    private String gameType;
}
