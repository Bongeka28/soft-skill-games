import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Score} from '../../../models/score.model';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService} from '../../../services/api.service';
import {AuthService} from '../../../services/auth.service';

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

@Component({
  selector: 'app-memory-focus-game',
  imports: [CommonModule],
  templateUrl: './memory-focus-game.component.html',
  styleUrl: './memory-focus-game.component.css'
})
export class MemoryFocusGameComponent {
  assessmentId: number = 0;
  cards: Card[] = [];
  flippedCards: Card[] = [];
  matches = 0;
  attempts = 0;
  totalPairs = 8;
  gameCompleted = false;
  startTime = new Date();
  elapsedTime = 0;
  finalTime = 0;
  gameTimer: any;

  symbols = ['🍎', '🍌', '🍒', '🍓', '🍊', '🍋', '🍐', '🍇'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.assessmentId = +params['assessmentId'];
    });
    this.initializeGame();
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
  }

  initializeGame() {
    // Create pairs of cards
    const pairs = [...this.symbols, ...this.symbols];

    // Shuffle the cards
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }

    // Create card objects
    this.cards = pairs.map((symbol, index) => ({
      id: index,
      symbol: symbol,
      isFlipped: false,
      isMatched: false
    }));

    this.startTime = new Date();
  }

  startTimer() {
    this.gameTimer = setInterval(() => {
      this.elapsedTime = Math.floor((new Date().getTime() - this.startTime.getTime()) / 1000);
    }, 1000);
  }

  flipCard(card: Card) {
    // Don't flip if already flipped, matched, or if two cards are already flipped
    if (card.isFlipped || card.isMatched || this.flippedCards.length >= 2) {
      return;
    }

    card.isFlipped = true;
    this.flippedCards.push(card);

    if (this.flippedCards.length === 2) {
      this.attempts++;
      this.checkForMatch();
    }
  }

  checkForMatch() {
    const [card1, card2] = this.flippedCards;

    if (card1.symbol === card2.symbol) {
      // Match found
      setTimeout(() => {
        card1.isMatched = true;
        card2.isMatched = true;
        card1.isFlipped = false;
        card2.isFlipped = false;
        this.matches++;
        this.flippedCards = [];

        if (this.matches === this.totalPairs) {
          this.gameCompleted = true;
          this.finalTime = this.elapsedTime;
          if (this.gameTimer) {
            clearInterval(this.gameTimer);
          }
          this.submitScore();
        }
      }, 1000);
    } else {
      // No match
      setTimeout(() => {
        card1.isFlipped = false;
        card2.isFlipped = false;
        this.flippedCards = [];
      }, 1500);
    }
  }

  get accuracy(): number {
    if (this.attempts === 0) return 100;
    return Math.round((this.matches / this.attempts) * 100);
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  submitScore() {
    const totalScore = this.calculateScore();
    const avgResponseTime = this.attempts > 0 ? (this.finalTime / this.attempts).toFixed(1) : '0';

    const gameData = {
      matches: this.matches,
      attempts: this.attempts,
      timeSpent: this.formatTime(this.finalTime),
      accuracy: this.accuracy,
      avgResponseTime: avgResponseTime
    };

    const feedback = this.generateFeedback(totalScore, this.accuracy, this.finalTime);

    const score: Score = {
      assessmentId: this.assessmentId,
      candidateId: this.authService.getCurrentUser()?.id!,
      score: totalScore.toString(),
      feedback: feedback,
      gameData: JSON.stringify(gameData)
    };

    this.apiService.createScore(score).subscribe({
      next: (result) => {
        console.log('Score submitted successfully:', result);
      },
      error: (error) => {
        console.error('Error submitting score:', error);
      }
    });
  }

  calculateScore(): number {
    // Score based on accuracy and time efficiency
    let score = this.accuracy; // Base score from accuracy

    // Time bonus (faster completion gets bonus points)
    const timeBonus = Math.max(0, 300 - this.finalTime) / 10; // Bonus for completing under 5 minutes
    score += timeBonus;

    // Cap the score at 100
    return Math.min(100, Math.round(score));
  }

  generateFeedback(totalScore: number, accuracy: number, time: number): string {
    let feedback = `Overall Performance: ${totalScore}% - `;

    if (totalScore >= 85) {
      feedback += "Outstanding memory and focus abilities! ";
    } else if (totalScore >= 70) {
      feedback += "Good memory and concentration skills with room for improvement. ";
    } else {
      feedback += "Developing memory and focus skills - practice will help improve performance. ";
    }

    feedback += `\n\nDetailed Analysis:\n`;
    feedback += `Accuracy: ${accuracy}% - `;
    feedback += accuracy >= 80 ? "Excellent precision in matching pairs. " : "Focus on careful observation to improve accuracy. ";

    feedback += `\nCompletion Time: ${this.formatTime(time)} - `;
    feedback += time <= 180 ? "Great speed and efficiency! " : time <= 300 ? "Good completion time. " : "Take time to observe patterns for better efficiency. ";

    feedback += `\nAttempts: ${this.attempts} - `;
    feedback += this.attempts <= 12 ? "Efficient matching with minimal attempts. " : "Consider developing memory strategies to reduce attempts. ";

    return feedback;
  }

  returnToDashboard() {
    this.router.navigate(['/candidate-dashboard']);
  }

}
