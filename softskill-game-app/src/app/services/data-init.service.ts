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
      }
    ];

    games.forEach(game => {
      this.apiService.getAllGames().subscribe({
        next: (existingGames) => {
          const gameExists = existingGames.some(g => g.gameName === game.gameName);
          if (!gameExists) {
            // Create the game using the endpoint (not implemented in the component, but would be similar)
            console.log('Creating game:', game.gameName);
            // You would call apiService.createGame(game) if that method exists
          }
        },
        error: (error) => {
          console.log('Error checking games:', error);
        }
      });
    });
  }
}
