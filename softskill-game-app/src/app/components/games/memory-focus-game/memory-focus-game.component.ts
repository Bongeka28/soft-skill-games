import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Score } from '../../../models/score.model';
import { Report } from '../../../models/report.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

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

  // Memory & Focus specific metrics
  memoryFocusMetrics = {
    concentrationLevel: 0,    // Based on consecutive correct matches
    memoryRetention: 0,       // Based on not repeating wrong matches
    visualProcessing: 0,      // Based on time between flips
    taskPersistence: 0        // Based on completion despite errors
  };

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
      if (!this.assessmentId || this.assessmentId === 0) {
        console.error('Invalid assessment ID:', params['assessmentId']);
        alert('Error: Invalid assessment ID. Returning to dashboard.');
        this.router.navigate(['/candidate-dashboard']);
        return;
      }
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
      // Match found - analyze memory & focus metrics
      this.analyzeSuccessfulMatch();

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
          this.calculateFinalMetrics();
          this.submitScore();
        }
      }, 1000);
    } else {
      // No match - analyze failed attempt
      this.analyzeFailedMatch();

      setTimeout(() => {
        card1.isFlipped = false;
        card2.isFlipped = false;
        this.flippedCards = [];
      }, 1500);
    }
  }

  analyzeSuccessfulMatch(): void {
    // Concentration level increases with successful matches
    this.memoryFocusMetrics.concentrationLevel += 15;

    // Memory retention bonus for remembering card positions
    this.memoryFocusMetrics.memoryRetention += 10;

    // Visual processing bonus for quick recognition
    if (this.elapsedTime < 30) {
      this.memoryFocusMetrics.visualProcessing += 20;
    } else if (this.elapsedTime < 60) {
      this.memoryFocusMetrics.visualProcessing += 15;
    } else {
      this.memoryFocusMetrics.visualProcessing += 10;
    }
  }

  analyzeFailedMatch(): void {
    // Slight penalty for failed matches but recognize persistence
    this.memoryFocusMetrics.taskPersistence += 5;

    // Reduced concentration for errors but not zero (shows effort)
    this.memoryFocusMetrics.concentrationLevel += 2;
  }

  calculateFinalMetrics(): void {
    // Normalize metrics to 0-100 scale
    const maxConcentration = this.totalPairs * 15 + (this.attempts - this.totalPairs) * 2;
    this.memoryFocusMetrics.concentrationLevel = Math.min(100,
      (this.memoryFocusMetrics.concentrationLevel / maxConcentration) * 100);

    this.memoryFocusMetrics.memoryRetention = Math.min(100, this.memoryFocusMetrics.memoryRetention);
    this.memoryFocusMetrics.visualProcessing = Math.min(100, this.memoryFocusMetrics.visualProcessing);

    // Task persistence based on completion
    this.memoryFocusMetrics.taskPersistence = this.gameCompleted ?
      Math.min(100, 80 + (this.accuracy / 5)) : Math.min(80, this.memoryFocusMetrics.taskPersistence);
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
      avgResponseTime: avgResponseTime,
      memoryFocusMetrics: this.memoryFocusMetrics
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

        // Create report after score is successfully created
        this.createReport(result);
      },
      error: (error) => {
        console.error('Error submitting score:', error);
      }
    });
  }

  createReport(scoreResult: Score): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || !scoreResult.scoreId) {
      console.error('Missing user data or score ID for report creation');
      return;
    }

    // Get HR ID from the assessment to determine who should receive the report
    this.getAssessmentDetails(scoreResult);
  }

  private getAssessmentDetails(scoreResult: Score): void {
    if (!this.authService.getCurrentUser()?.id) return;

    this.apiService.getAssessmentsByCandidateId(this.authService.getCurrentUser()!.id!).subscribe({
      next: (assessments) => {
        const currentAssessment = assessments.find(a => a.id === this.assessmentId);
        if (currentAssessment) {
          this.generateAndSubmitReport(scoreResult, currentAssessment);
        } else {
          console.error('Assessment not found for report generation');
        }
      },
      error: (error) => {
        console.error('Error fetching assessment for report:', error);
      }
    });
  }

  private generateAndSubmitReport(scoreResult: Score, assessment: any): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      console.error('No current user found for report creation');
      return;
    }

    const report = {
      userId: assessment.hrId, // HR who created the assessment
      scoreId: scoreResult.scoreId!,
      fullname: `${currentUser.firstName} ${currentUser.lastName}`,
      email: currentUser.email,
      score: scoreResult.score,
      skillType: 'Memory & Focus', // Memory Focus tests memory and concentration skills
      feedback: this.generateDetailedReportFeedback(),
    };

    console.log('Creating report:', report);

    this.apiService.createReport(report).subscribe({
      next: (reportResult) => {
        console.log('Report created successfully:', reportResult);
      },
      error: (error) => {
        console.error('Error creating report:', error);
        console.log('Report data that failed:', report);
      }
    });
  }

  private generateDetailedReportFeedback(): string {
    const currentUser = this.authService.getCurrentUser();
    let reportFeedback = `MEMORY & FOCUS ASSESSMENT REPORT\n`;
    reportFeedback += `Candidate: ${currentUser?.firstName} ${currentUser?.lastName}\n`;
    reportFeedback += `Email: ${currentUser?.email}\n`;
    reportFeedback += `Assessment Date: ${new Date().toLocaleDateString()}\n`;
    reportFeedback += `Skill Assessed: Memory & Focus\n\n`;

    reportFeedback += `PERFORMANCE SUMMARY:\n`;
    reportFeedback += `Final Score: ${this.calculateScore()}%\n`;
    reportFeedback += `Completion Status: ${this.gameCompleted ? 'Successfully completed' : 'Incomplete'}\n`;
    reportFeedback += `Matches Found: ${this.matches} of ${this.totalPairs}\n`;
    reportFeedback += `Accuracy: ${this.accuracy}%\n`;
    reportFeedback += `Total Attempts: ${this.attempts}\n`;
    reportFeedback += `Time Taken: ${this.formatTime(this.finalTime)}\n`;
    reportFeedback += `Average Response Time: ${this.attempts > 0 ? (this.finalTime / this.attempts).toFixed(1) : '0'} seconds per attempt\n\n`;

    reportFeedback += `DETAILED COGNITIVE ANALYSIS:\n`;
    reportFeedback += `Concentration Level: ${Math.round(this.memoryFocusMetrics.concentrationLevel)}%\n`;
    if (this.memoryFocusMetrics.concentrationLevel >= 80) {
      reportFeedback += `- Excellent sustained attention and focus\n`;
      reportFeedback += `- Demonstrates strong ability to maintain concentration under pressure\n`;
    } else if (this.memoryFocusMetrics.concentrationLevel >= 60) {
      reportFeedback += `- Good concentration abilities with occasional lapses\n`;
      reportFeedback += `- Shows potential for maintaining focus in work environments\n`;
    } else {
      reportFeedback += `- Concentration skills need development\n`;
      reportFeedback += `- Would benefit from attention training and focus exercises\n`;
    }

    reportFeedback += `\nMemory Retention: ${Math.round(this.memoryFocusMetrics.memoryRetention)}%\n`;
    if (this.memoryFocusMetrics.memoryRetention >= 80) {
      reportFeedback += `- Outstanding short-term memory capabilities\n`;
      reportFeedback += `- Excellent ability to retain and recall visual information\n`;
    } else if (this.memoryFocusMetrics.memoryRetention >= 60) {
      reportFeedback += `- Good memory retention with room for improvement\n`;
      reportFeedback += `- Shows adequate recall abilities for most tasks\n`;
    } else {
      reportFeedback += `- Memory retention needs strengthening\n`;
      reportFeedback += `- Would benefit from memory enhancement techniques\n`;
    }

    reportFeedback += `\nVisual Processing: ${Math.round(this.memoryFocusMetrics.visualProcessing)}%\n`;
    if (this.memoryFocusMetrics.visualProcessing >= 80) {
      reportFeedback += `- Excellent visual pattern recognition\n`;
      reportFeedback += `- Strong ability to quickly process visual information\n`;
    } else if (this.memoryFocusMetrics.visualProcessing >= 60) {
      reportFeedback += `- Good visual processing abilities\n`;
      reportFeedback += `- Adequate speed in recognizing visual patterns\n`;
    } else {
      reportFeedback += `- Visual processing speed could be improved\n`;
      reportFeedback += `- May need more time for visual information processing\n`;
    }

    reportFeedback += `\nTask Persistence: ${Math.round(this.memoryFocusMetrics.taskPersistence)}%\n`;
    if (this.memoryFocusMetrics.taskPersistence >= 80) {
      reportFeedback += `- Excellent determination and task completion drive\n`;
      reportFeedback += `- Shows strong resilience when facing challenges\n`;
    } else {
      reportFeedback += `- Shows good effort in task completion\n`;
      reportFeedback += `- Can maintain engagement despite difficulties\n`;
    }

    reportFeedback += `\nWORKPLACE SUITABILITY:\n`;
    const overallScore = this.calculateScore();
    if (overallScore >= 85) {
      reportFeedback += `HIGHLY RECOMMENDED - Excellent memory and focus abilities suitable for detail-oriented and high-concentration roles.\n`;
      reportFeedback += `Ideal for: Data analysis, quality control, research, design, and complex problem-solving positions.\n`;
    } else if (overallScore >= 70) {
      reportFeedback += `RECOMMENDED - Good cognitive abilities with strong potential for focused work.\n`;
      reportFeedback += `Suitable for: Administrative roles, customer service, project coordination, and collaborative tasks.\n`;
    } else if (overallScore >= 55) {
      reportFeedback += `CONDITIONAL - Basic memory and focus skills present, may need supportive work environment.\n`;
      reportFeedback += `Best for: Structured roles with clear guidelines and regular check-ins.\n`;
    } else {
      reportFeedback += `NEEDS DEVELOPMENT - Significant improvement needed in memory and concentration skills.\n`;
      reportFeedback += `Recommend: Training programs focused on attention and memory enhancement.\n`;
    }

    reportFeedback += `\nDETAILED PERFORMANCE DATA:\n`;
    reportFeedback += `Game Completion: ${this.gameCompleted ? 'Yes' : 'No'}\n`;
    reportFeedback += `Efficiency Ratio: ${this.accuracy}% (matches/attempts)\n`;
    reportFeedback += `Speed Factor: ${this.finalTime <= 180 ? 'Fast' : this.finalTime <= 300 ? 'Average' : 'Slow'}\n`;

    if (this.attempts > 0) {
      const avgTime = (this.finalTime / this.attempts).toFixed(1);
      reportFeedback += `Decision Speed: ${parseFloat(avgTime) < 5 ? 'Quick' : parseFloat(avgTime) < 10 ? 'Moderate' : 'Deliberate'} (${avgTime}s per decision)\n`;
    }

    return reportFeedback;
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
