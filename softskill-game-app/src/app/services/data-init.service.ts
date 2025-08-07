import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Game } from '../models/game.model';
import { Company } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class DataInitService {

  constructor(private apiService: ApiService) {
  }

  initializeDefaultData() {
    this.createDefaultCompany();
    this.createDefaultGames();
  }

  private createDefaultCompany() {
    const defaultCompany: Company = {
      companyName: "Tech Solutions Inc",
      companyNumber: "TECH001"
    };

    this.apiService.createCompany(defaultCompany).subscribe({
      next: (company) => {
        console.log('Default company created:', company);
      },
      error: (error) => {
        console.log('Company might already exist:', error);
      }
    });
  }

  private createDefaultGames() {
    const games: Game[] = [
      {
        gameName: "Team Collaboration Challenge",
        gameDescription: "Test your critical thinking skills in team collaboration scenarios. Navigate complex workplace situations and demonstrate problem-solving abilities.",
        skillName: "Critical Thinking",
        gameUrl: "/game/critical-thinking",
        gameImage: "https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Critical+Thinking",
        active: true,
        gameType: "CRITICAL_THINKING"
      },
      {
        gameName: "Memory & Focus Challenge",
        gameDescription: "Test your memory and focus abilities with our interactive card matching game. Improve concentration and cognitive skills.",
        skillName: "Memory & Focus",
        gameUrl: "/game/memory-focus",
        gameImage: "https://via.placeholder.com/300x200/059669/FFFFFF?text=Memory+%26+Focus",
        active: true,
        gameType: "MEMORY_FOCUS"
      },
      {
        gameName: "Code Breaker Challenge",
        gameDescription: "Test your problem-solving skills by cracking secret codes using logical deduction and strategic thinking. Perfect for evaluating analytical reasoning abilities.",
        skillName: "Problem Solving",
        gameUrl: "/game/code-breaker",
        gameImage: "https://via.placeholder.com/300x200/DC2626/FFFFFF?text=Code+Breaker",
        active: true,
        gameType: "CODE_BREAKER"
      }
    ];

    games.forEach(game => {
      this.apiService.getAllGames().subscribe({
        next: (existingGames) => {
          const gameExists = existingGames.some(g => g.gameName === game.gameName);
          if (!gameExists) {
            console.log('Creating game:', game.gameName);
            // Note: You'll need to add createGame method to ApiService
            // this.apiService.createGame(game).subscribe({...});
          }
        },
        error: (error) => {
          console.log('Error checking games:', error);
        }
      });
    });
  }
}
