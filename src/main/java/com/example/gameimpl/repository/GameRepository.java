package com.example.gameimpl.repository;

import com.example.gameimpl.model.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameRepository extends JpaRepository<Game, Integer> {
    List<Game> findByActive(boolean active);
    List<Game> findByGameType(String gameType);

}
