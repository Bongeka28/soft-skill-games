package com.example.gameimpl.controller;


import com.example.gameimpl.model.Game;
import com.example.gameimpl.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/games")
@CrossOrigin(origins = "*")
public class GameController {


    @Autowired
    private GameService gameService;

    @GetMapping
    public List<Game> getAllGames() {
        return gameService.getAllGames();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Game> getGameById(@PathVariable Integer id) {
        Optional<Game> game = gameService.getGameById(id);
        return game.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/active")
    public List<Game> getActiveGames() {
        return gameService.getActiveGames();
    }

    @GetMapping("/type/{gameType}")
    public List<Game> getGamesByType(@PathVariable String gameType) {
        return gameService.getGamesByType(gameType);
    }

    @PostMapping
    public Game createGame(@RequestBody Game game) {
        return gameService.saveGame(game);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Game> updateGame(@PathVariable Integer id, @RequestBody Game game) {
        if (!gameService.getGameById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        game.setId(id);
        return ResponseEntity.ok(gameService.saveGame(game));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGame(@PathVariable Integer id) {
        if (!gameService.getGameById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        gameService.deleteGame(id);
        return ResponseEntity.noContent().build();
    }
}
