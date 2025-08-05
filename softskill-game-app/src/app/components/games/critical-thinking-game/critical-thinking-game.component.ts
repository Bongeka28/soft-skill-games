import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {ApiService} from '../../../services/api.service';
import {AuthService} from '../../../services/auth.service';
import {Score} from '../../../models/score.model';

interface Question {
  id: number;
  scenario: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: 'problemSolving' | 'teamwork' | 'communication';
}
@Component({
  selector: 'app-critical-thinking-game',
  imports: [CommonModule],
  templateUrl: './critical-thinking-game.component.html',
  styleUrl: './critical-thinking-game.component.css'
})
export class CriticalThinkingGameComponent {
assessmentId: number = 0;
  questions: Question[] = [
    {
      id: 1,
      scenario: "Your team is working on a critical project with a tight deadline. One team member consistently misses meetings and doesn't complete their assigned tasks on time, causing delays for the entire project.",
      question: "What is the best approach to address this situation?",
      options: [
        "Ignore the issue and work around the team member to avoid conflict",
        "Immediately report the team member to management without discussion",
        "Have a private, constructive conversation with the team member to understand their challenges and find solutions",
        "Publicly call out the team member during the next team meeting"
      ],
      correctAnswer: 2,
      category: 'teamwork'
    },
    {
      id: 2,
      scenario: "During a brainstorming session, your team is split between two different approaches to solve a problem. The discussion is getting heated, and team members are becoming defensive about their ideas.",
      question: "How should you help facilitate a productive resolution?",
      options: [
        "Support the most popular idea to move forward quickly",
        "Suggest taking a break and revisiting the discussion later with a structured evaluation framework",
        "Let the team argue it out until someone gives up",
        "Make the decision yourself to end the conflict"
      ],
      correctAnswer: 1,
      category: 'problemSolving'
    },
    {
      id: 3,
      scenario: "You discover that there's a significant error in a report that has already been shared with stakeholders. The error could impact important business decisions, but fixing it would delay the project timeline.",
      question: "What is the most appropriate action to take?",
      options: [
        "Hope no one notices the error and continue with the project",
        "Quietly fix the error in future versions without mentioning it",
        "Immediately inform stakeholders about the error, provide a corrected version, and explain the impact on timeline",
        "Wait until someone asks about the discrepancy before addressing it"
      ],
      correctAnswer: 2,
      category: 'communication'
    },
    {
      id: 4,
      scenario: "Your team needs to implement a new process, but some team members are resistant to change and prefer the old way of doing things. They express concerns about the learning curve and potential disruption.",
      question: "How would you best handle this resistance to change?",
      options: [
        "Force the implementation regardless of team concerns",
        "Abandon the new process to maintain team harmony",
        "Listen to concerns, provide training and support, and demonstrate the benefits of the new process through small pilot implementations",
        "Let each team member choose whether to adopt the new process or not"
      ],
      correctAnswer: 2,
      category: 'teamwork'
    },
    {
      id: 5,
      scenario: "You're leading a cross-functional project with team members from different departments who have conflicting priorities and working styles. Communication is becoming fragmented and progress is slow.",
      question: "What strategy would be most effective for improving collaboration?",
      options: [
        "Work with each department separately to avoid conflicts",
        "Establish clear project goals, create structured communication channels, and hold regular alignment meetings with all stakeholders",
        "Ask management to assign the project to a single department",
        "Set individual deadlines for each department and let them work independently"
      ],
      correctAnswer: 1,
      category: 'communication'
    }
  ];

  currentQuestionIndex = 0;
  selectedAnswer: number | null = null;
  answers: number[] = [];
  gameCompleted = false;
  startTime = new Date();

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
  }

  get currentQuestion(): Question | null {
    return this.questions[this.currentQuestionIndex] || null;
  }

  selectAnswer(answerIndex: number) {
    this.selectedAnswer = answerIndex;
  }

  nextQuestion() {
    if (this.selectedAnswer !== null) {
      this.answers[this.currentQuestionIndex] = this.selectedAnswer;

      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
        this.selectedAnswer = this.answers[this.currentQuestionIndex] ?? null;
      } else {
        this.completeGame();
      }
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.selectedAnswer = this.answers[this.currentQuestionIndex] ?? null;
    }
  }

  completeGame() {
    const endTime = new Date();
    const timeSpent = Math.floor((endTime.getTime() - this.startTime.getTime()) / 1000);

    // Calculate score
    let correctAnswers = 0;
    const categoryScores = { problemSolving: 0, teamwork: 0, communication: 0 };
    const categoryCounts = { problemSolving: 0, teamwork: 0, communication: 0 };

    this.questions.forEach((question, index) => {
      if (this.answers[index] === question.correctAnswer) {
        correctAnswers++;
        categoryScores[question.category]++;
      }
      categoryCounts[question.category]++;
    });

    const totalScore = Math.round((correctAnswers / this.questions.length) * 100);

    // Calculate category percentages
    const categoryPercentages = {
      problemSolving: Math.round((categoryScores.problemSolving / categoryCounts.problemSolving) * 100),
      teamwork: Math.round((categoryScores.teamwork / categoryCounts.teamwork) * 100),
      communication: Math.round((categoryScores.communication / categoryCounts.communication) * 100)
    };

    const gameData = {
      correctAnswers,
      totalQuestions: this.questions.length,
      timeSpent: `${Math.floor(timeSpent / 60)}:${(timeSpent % 60).toString().padStart(2, '0')}`,
      categories: categoryPercentages,
      answers: this.answers
    };

    const feedback = this.generateFeedback(totalScore, categoryPercentages);

    const score: Score = {
      assessmentId: this.assessmentId,
      candidateId: this.authService.getCurrentUser()?.id!,
      score: totalScore.toString(),
      feedback: feedback,
      gameData: JSON.stringify(gameData)
    };

    // Submit score
    this.apiService.createScore(score).subscribe({

      next: (result) => {
        console.log('Score submitted successfully:', result);
        // Update assessment status to completed
        // Note: You might want to add this API call to update assessment status
        this.gameCompleted = true;
      },
      error: (error) => {
        console.error('Error submitting score:', error);
        console.log(score);
        // Still show completion but maybe show an error message
        this.gameCompleted = true;
      }
    });
  }

  generateFeedback(totalScore: number, categoryScores: any): string {
    let feedback = `Overall Performance: ${totalScore}% - `;

    if (totalScore >= 80) {
      feedback += "Excellent critical thinking skills demonstrated! ";
    } else if (totalScore >= 60) {
      feedback += "Good critical thinking abilities with room for growth. ";
    } else {
      feedback += "Developing critical thinking skills - consider additional training. ";
    }

    feedback += "\n\nCategory Breakdown:\n";
    feedback += `Problem Solving: ${categoryScores.problemSolving}% - `;
    feedback += categoryScores.problemSolving >= 75 ? "Strong analytical skills. " : "Focus on structured problem-solving approaches. ";

    feedback += `\nTeamwork: ${categoryScores.teamwork}% - `;
    feedback += categoryScores.teamwork >= 75 ? "Excellent collaboration mindset. " : "Develop team collaboration strategies. ";

    feedback += `\nCommunication: ${categoryScores.communication}% - `;
    feedback += categoryScores.communication >= 75 ? "Great communication approach. " : "Work on clear, timely communication. ";

    return feedback;
  }

  returnToDashboard() {
    this.router.navigate(['/candidate-dashboard']);
  }

}
