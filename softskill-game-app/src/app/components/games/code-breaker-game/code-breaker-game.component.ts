// code-breaker-game.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { Score } from '../../../models/score.model';

interface GameState {
  secretCode: number[];
  currentGuess: number[];
  guessHistory: GuessResult[];
  attempt: number;
  maxAttempts: number;
  gameOver: boolean;
  gameWon: boolean;
  score: number;
}

interface GuessResult {
  digits: number[];
  feedback: ('correct' | 'misplaced' | 'wrong')[];
}

@Component({
  selector: 'app-code-breaker-game',
  imports: [CommonModule],
  templateUrl: './code-breaker-game.component.html',
  styleUrl: './code-breaker-game.component.css'
})
export class CodeBreakerGameComponent implements OnInit {
  assessmentId: number = 0;
  gameState: GameState = {
    secretCode: [],
    currentGuess: [],
    guessHistory: [],
    attempt: 0,
    maxAttempts: 4,
    gameOver: false,
    gameWon: false,
    score: 0
  };

  numberPadDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  startTime = new Date();
  gameCompleted = false;

  // Problem-solving metrics
  problemSolvingMetrics = {
    totalAttempts: 0,
    timeSpent: 0,
    strategicThinking: 0, // Based on guess patterns
    logicalReasoning: 0,  // Based on using feedback effectively
    persistence: 0        // Based on completion despite setbacks
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.assessmentId = +params['assessmentId'];
      if (!this.assessmentId || this.assessmentId === 0) {
        console.error('Invalid assessment ID:', params['assessmentId']);
        alert('Error: Invalid assessment ID. Returning to dashboard.');
        this.router.navigate(['/candidate-dashboard']);
        return;
      }
    });
    this.startTime = new Date();
    this.initializeGame();
  }

  initializeGame(): void {
    this.generateSecretCode();
    this.gameState = {
      ...this.gameState,
      currentGuess: [],
      guessHistory: [],
      attempt: 0,
      gameOver: false,
      gameWon: false,
      score: 0
    };
  }

  generateSecretCode(): void {
    const availableDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    this.gameState.secretCode = [];

    while (this.gameState.secretCode.length < 4) {
      const randomIndex = Math.floor(Math.random() * availableDigits.length);
      this.gameState.secretCode.push(availableDigits.splice(randomIndex, 1)[0]);
    }
  }

  get currentGuessSlots(): (number | null)[] {
    const slots: (number | null)[] = Array(4).fill(null);
    this.gameState.currentGuess.forEach((digit, index) => {
      slots[index] = digit;
    });
    return slots;
  }

  selectDigit(digit: number): void {
    if (this.gameState.currentGuess.length < 4 && !this.gameState.currentGuess.includes(digit)) {
      this.gameState.currentGuess.push(digit);
    }
  }

  removeLastDigit(): void {
    if (this.gameState.currentGuess.length > 0) {
      this.gameState.currentGuess.pop();
    }
  }

  isDigitUsed(digit: number): boolean {
    return this.gameState.currentGuess.includes(digit);
  }

  canSubmitGuess(): boolean {
    return this.gameState.currentGuess.length === 4 && !this.gameState.gameOver;
  }

  getFeedback(guess: number[]): ('correct' | 'misplaced' | 'wrong')[] {
    return guess.map((digit, index) => {
      if (digit === this.gameState.secretCode[index]) {
        return 'correct';
      } else if (this.gameState.secretCode.includes(digit)) {
        return 'misplaced';
      } else {
        return 'wrong';
      }
    });
  }

  submitGuess(): void {
    if (!this.canSubmitGuess()) return;

    const feedback = this.getFeedback(this.gameState.currentGuess);
    const guessResult: GuessResult = {
      digits: [...this.gameState.currentGuess],
      feedback: feedback
    };

    this.gameState.guessHistory.unshift(guessResult);
    this.problemSolvingMetrics.totalAttempts++;

    // Analyze problem-solving approach
    this.analyzeStrategicThinking(guessResult);

    // Check if won
    if (this.gameState.currentGuess.join('') === this.gameState.secretCode.join('')) {
      this.gameState.gameWon = true;
      this.gameState.gameOver = true;
      this.calculateScore();
      this.completeGame();
      return;
    }

    this.gameState.attempt++;

    // Check if out of attempts
    if (this.gameState.attempt >= this.gameState.maxAttempts) {
      this.gameState.gameWon = false;
      this.gameState.gameOver = true;
      this.gameState.score = 0;
      this.completeGame();
      return;
    }

    // Reset current guess for next attempt
    this.gameState.currentGuess = [];
  }

  analyzeStrategicThinking(guessResult: GuessResult): void {
    // Award points for strategic thinking
    const correctCount = guessResult.feedback.filter(f => f === 'correct').length;
    const misplacedCount = guessResult.feedback.filter(f => f === 'misplaced').length;

    // Strategic thinking: using previous feedback effectively
    if (this.gameState.guessHistory.length > 1) {
      const prevGuess = this.gameState.guessHistory[1];
      let usedFeedbackWell = 0;

      // Check if they kept correct digits in same positions
      prevGuess.feedback.forEach((feedback, index) => {
        if (feedback === 'correct' && guessResult.digits[index] === prevGuess.digits[index]) {
          usedFeedbackWell++;
        }
      });

      this.problemSolvingMetrics.logicalReasoning += usedFeedbackWell * 10;
    }

    // Award strategic points for systematic approach
    this.problemSolvingMetrics.strategicThinking += (correctCount * 15) + (misplacedCount * 10);
  }

  calculateScore(): void {
    const baseScore = this.gameState.gameWon ? 100 : 0;
    let attemptBonus = 0;

    if (this.gameState.gameWon) {
      switch (this.gameState.attempt) {
        case 0: attemptBonus = 50; break;
        case 1: attemptBonus = 30; break;
        case 2: attemptBonus = 20; break;
        case 3: attemptBonus = 10; break;
        default: attemptBonus = 0; break;
      }
    }

    // Calculate persistence score
    this.problemSolvingMetrics.persistence = this.gameState.gameWon ? 100 :
      Math.min(90, this.gameState.attempt * 20);

    this.gameState.score = Math.min(100, baseScore + attemptBonus);
  }

  completeGame(): void {
    const endTime = new Date();
    this.problemSolvingMetrics.timeSpent = Math.floor((endTime.getTime() - this.startTime.getTime()) / 1000);

    // Calculate final problem-solving metrics (0-100 scale)
    const maxStrategicPoints = this.gameState.maxAttempts * 4 * 15; // Max possible strategic points
    this.problemSolvingMetrics.strategicThinking = Math.min(100,
      (this.problemSolvingMetrics.strategicThinking / maxStrategicPoints) * 100);

    this.problemSolvingMetrics.logicalReasoning = Math.min(100, this.problemSolvingMetrics.logicalReasoning);

    const gameData = {
      won: this.gameState.gameWon,
      attempts: this.gameState.attempt + (this.gameState.gameWon ? 1 : 0),
      maxAttempts: this.gameState.maxAttempts,
      timeSpent: `${Math.floor(this.problemSolvingMetrics.timeSpent / 60)}:${(this.problemSolvingMetrics.timeSpent % 60).toString().padStart(2, '0')}`,
      secretCode: this.gameState.secretCode,
      guessHistory: this.gameState.guessHistory,
      problemSolvingMetrics: this.problemSolvingMetrics
    };

    const feedback = this.generateFeedback();

    const score: Score = {
      assessmentId: this.assessmentId,
      candidateId: this.authService.getCurrentUser()?.id!,
      score: this.gameState.score.toString(),
      feedback: feedback,
      gameData: JSON.stringify(gameData)
    };

    // Submit score
    this.apiService.createScore(score).subscribe({
      next: (result) => {
        console.log('Score submitted successfully:', result);
        this.gameCompleted = true;
      },
      error: (error) => {
        console.error('Error submitting score:', error);
        console.log(score);
        this.gameCompleted = true;
      }
    });
  }

  generateFeedback(): string {
    let feedback = `Code Breaker Assessment - Problem Solving Score: ${this.gameState.score}%\n\n`;

    if (this.gameState.gameWon) {
      feedback += `🎉 Excellent! You cracked the code in ${this.gameState.attempt + 1} attempt${this.gameState.attempt === 0 ? '' : 's'}.\n\n`;
    } else {
      feedback += `The code was not cracked, but you demonstrated persistence and logical thinking.\n\n`;
    }

    feedback += `Problem-Solving Analysis:\n`;
    feedback += `• Strategic Thinking: ${Math.round(this.problemSolvingMetrics.strategicThinking)}% - `;
    feedback += this.problemSolvingMetrics.strategicThinking >= 70 ?
      'Strong systematic approach to problem-solving.\n' :
      'Consider developing more structured problem-solving strategies.\n';

    feedback += `• Logical Reasoning: ${Math.round(this.problemSolvingMetrics.logicalReasoning)}% - `;
    feedback += this.problemSolvingMetrics.logicalReasoning >= 70 ?
      'Excellent use of feedback to refine approach.\n' :
      'Focus on better utilizing available information.\n';

    feedback += `• Persistence: ${Math.round(this.problemSolvingMetrics.persistence)}% - `;
    feedback += this.problemSolvingMetrics.persistence >= 80 ?
      'Great determination and resilience.\n' :
      'Continue building perseverance in challenging situations.\n';

    feedback += `\nTime taken: ${Math.floor(this.problemSolvingMetrics.timeSpent / 60)}:${(this.problemSolvingMetrics.timeSpent % 60).toString().padStart(2, '0')}\n`;
    feedback += `The secret code was: ${this.gameState.secretCode.join(' ')}`;

    return feedback;
  }

  getDigitTileClass(feedback: 'correct' | 'misplaced' | 'wrong'): string {
    switch (feedback) {
      case 'correct': return 'bg-green-400';
      case 'misplaced': return 'bg-yellow-400';
      case 'wrong': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  }

  getNumberPadButtonClass(digit: number): string {
    const baseClasses = 'bg-gray-100 hover:bg-indigo-500 hover:text-white text-gray-700';

    return this.isDigitUsed(digit)
      ? `${baseClasses} opacity-30 cursor-not-allowed`
      : baseClasses;
  }

  restartGame(): void {
    this.startTime = new Date();
    this.problemSolvingMetrics = {
      totalAttempts: 0,
      timeSpent: 0,
      strategicThinking: 0,
      logicalReasoning: 0,
      persistence: 0
    };
    this.initializeGame();
  }

  returnToDashboard(): void {
    this.router.navigate(['/candidate-dashboard']);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
