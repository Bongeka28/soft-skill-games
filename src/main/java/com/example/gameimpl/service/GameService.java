package com.example.gameimpl.service;

import com.example.gameimpl.model.Game;
import com.example.gameimpl.repository.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GameService {

    @Autowired
    private GameRepository gameRepository;

    public List<Game> getAllGames() {
        return gameRepository.findAll();
    }

    public Optional<Game> getGameById(Integer id) {
        return gameRepository.findById(id);
    }

    public List<Game> getActiveGames() {
        return gameRepository.findByActive(true);
    }

    public List<Game> getGamesByType(String gameType) {
        return gameRepository.findByGameType(gameType);
    }

    public Game saveGame(Game game) {
        return gameRepository.save(game);
    }

    public void deleteGame(Integer id) {
        gameRepository.deleteById(id);
    }
}
