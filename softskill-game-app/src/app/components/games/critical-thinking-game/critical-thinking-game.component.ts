import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { Score } from '../../../models/score.model';
import { Report } from '../../../models/report.model';

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

  // Critical thinking specific metrics
  criticalThinkingMetrics = {
    analyticalReasoning: 0,     // Based on problem-solving questions
    interpersonalSkills: 0,     // Based on teamwork questions
    communicationEffectiveness: 0, // Based on communication questions
    decisionMakingSpeed: 0,     // Based on time per question
    consistencyIndex: 0         // Based on response patterns
  };

  questionStartTimes: Date[] = [];

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
    this.questionStartTimes[0] = new Date(); // Track first question start time
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

      // Analyze response for metrics
      this.analyzeQuestionResponse();

      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
        this.selectedAnswer = this.answers[this.currentQuestionIndex] ?? null;
        // Track start time for next question
        if (!this.questionStartTimes[this.currentQuestionIndex]) {
          this.questionStartTimes[this.currentQuestionIndex] = new Date();
        }
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

  analyzeQuestionResponse(): void {
    const currentQuestion = this.questions[this.currentQuestionIndex];
    const responseTime = new Date().getTime() - this.questionStartTimes[this.currentQuestionIndex].getTime();
    const responseTimeSeconds = responseTime / 1000;

    // Decision making speed analysis (optimal time is 30-90 seconds per question)
    let speedScore = 0;
    if (responseTimeSeconds >= 30 && responseTimeSeconds <= 90) {
      speedScore = 100; // Optimal deliberation time
    } else if (responseTimeSeconds < 30) {
      speedScore = 70; // Quick but possibly rushed
    } else if (responseTimeSeconds <= 180) {
      speedScore = 85; // Thorough consideration
    } else {
      speedScore = 60; // Possibly overthinking
    }

    this.criticalThinkingMetrics.decisionMakingSpeed += speedScore;

    // Analyze correctness by category
    const isCorrect = this.selectedAnswer === currentQuestion.correctAnswer;

    if (isCorrect) {
      switch (currentQuestion.category) {
        case 'problemSolving':
          this.criticalThinkingMetrics.analyticalReasoning += 100;
          break;
        case 'teamwork':
          this.criticalThinkingMetrics.interpersonalSkills += 100;
          break;
        case 'communication':
          this.criticalThinkingMetrics.communicationEffectiveness += 100;
          break;
      }
    } else {
      // Partial credit for attempting
      switch (currentQuestion.category) {
        case 'problemSolving':
          this.criticalThinkingMetrics.analyticalReasoning += 25;
          break;
        case 'teamwork':
          this.criticalThinkingMetrics.interpersonalSkills += 25;
          break;
        case 'communication':
          this.criticalThinkingMetrics.communicationEffectiveness += 25;
          break;
      }
    }
  }

  calculateFinalMetrics(totalScore: number, categoryPercentages: any): void {
    // Normalize metrics to 0-100 scale
    const problemSolvingQuestions = this.questions.filter(q => q.category === 'problemSolving').length;
    const teamworkQuestions = this.questions.filter(q => q.category === 'teamwork').length;
    const communicationQuestions = this.questions.filter(q => q.category === 'communication').length;

    this.criticalThinkingMetrics.analyticalReasoning = Math.min(100,
      this.criticalThinkingMetrics.analyticalReasoning / problemSolvingQuestions);

    this.criticalThinkingMetrics.interpersonalSkills = Math.min(100,
      this.criticalThinkingMetrics.interpersonalSkills / teamworkQuestions);

    this.criticalThinkingMetrics.communicationEffectiveness = Math.min(100,
      this.criticalThinkingMetrics.communicationEffectiveness / communicationQuestions);

    this.criticalThinkingMetrics.decisionMakingSpeed = Math.min(100,
      this.criticalThinkingMetrics.decisionMakingSpeed / this.questions.length);

    // Calculate consistency index based on performance variation across categories
    const scores = [
      categoryPercentages.problemSolving,
      categoryPercentages.teamwork,
      categoryPercentages.communication
    ];
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((acc, score) => acc + Math.pow(score - average, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);

    // Lower standard deviation = higher consistency (inverse relationship)
    this.criticalThinkingMetrics.consistencyIndex = Math.max(0, 100 - (standardDeviation * 2));
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

    // Calculate final metrics
    this.calculateFinalMetrics(totalScore, categoryPercentages);

    const gameData = {
      correctAnswers,
      totalQuestions: this.questions.length,
      timeSpent: `${Math.floor(timeSpent / 60)}:${(timeSpent % 60).toString().padStart(2, '0')}`,
      categories: categoryPercentages,
      answers: this.answers,
      criticalThinkingMetrics: this.criticalThinkingMetrics,
      averageTimePerQuestion: (timeSpent / this.questions.length).toFixed(1)
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

        // Update assessment status to completed after score submission
        this.updateAssessmentStatus();

        // Create report after score is successfully created
        this.createReport(result);

        this.gameCompleted = true;
      },
      error: (error) => {
        console.error('Error submitting score:', error);
        console.log(score);
        this.gameCompleted = true;
      }
    });
  }

  updateAssessmentStatus(): void {
    // First, get the current assessment details
    if (!this.authService.getCurrentUser()?.id) {
      console.error('No current user found for assessment update');
      return;
    }

    this.apiService.getAssessmentsByCandidateId(this.authService.getCurrentUser()!.id!).subscribe({
      next: (assessments) => {
        const currentAssessment = assessments.find(a => a.id === this.assessmentId);
        if (currentAssessment) {
          // Update the assessment status to COMPLETED
          const updatedAssessment = {
            ...currentAssessment,
            status: 'COMPLETED' as const,
            updatedAt: new Date().toISOString()
          };

          this.apiService.updateAssessment(this.assessmentId, updatedAssessment).subscribe({
            next: (result) => {
              console.log('Assessment status updated to COMPLETED:', result);
            },
            error: (error) => {
              console.error('Error updating assessment status:', error);
              console.log('Assessment data:', updatedAssessment);
            }
          });
        } else {
          console.error('Assessment not found for status update');
        }
      },
      error: (error) => {
        console.error('Error fetching assessment for status update:', error);
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
      skillType: 'Critical Thinking', // Critical Thinking tests reasoning and decision-making skills
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
    const endTime = new Date();
    const totalTimeSpent = Math.floor((endTime.getTime() - this.startTime.getTime()) / 1000);

    // Calculate scores
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
    const categoryPercentages = {
      problemSolving: Math.round((categoryScores.problemSolving / categoryCounts.problemSolving) * 100),
      teamwork: Math.round((categoryScores.teamwork / categoryCounts.teamwork) * 100),
      communication: Math.round((categoryScores.communication / categoryCounts.communication) * 100)
    };

    let reportFeedback = `CRITICAL THINKING ASSESSMENT REPORT\n`;
    reportFeedback += `Candidate: ${currentUser?.firstName} ${currentUser?.lastName}\n`;
    reportFeedback += `Email: ${currentUser?.email}\n`;
    reportFeedback += `Assessment Date: ${new Date().toLocaleDateString()}\n`;
    reportFeedback += `Skill Assessed: Critical Thinking\n\n`;

    reportFeedback += `PERFORMANCE SUMMARY:\n`;
    reportFeedback += `Final Score: ${totalScore}%\n`;
    reportFeedback += `Correct Answers: ${correctAnswers} of ${this.questions.length}\n`;
    reportFeedback += `Total Time: ${Math.floor(totalTimeSpent / 60)}:${(totalTimeSpent % 60).toString().padStart(2, '0')}\n`;
    reportFeedback += `Average Time per Question: ${(totalTimeSpent / this.questions.length).toFixed(1)} seconds\n\n`;

    reportFeedback += `CATEGORY PERFORMANCE:\n`;
    reportFeedback += `Problem Solving: ${categoryPercentages.problemSolving}%\n`;
    if (categoryPercentages.problemSolving >= 80) {
      reportFeedback += `- Excellent analytical and logical reasoning abilities\n`;
      reportFeedback += `- Strong capacity for systematic problem analysis\n`;
    } else if (categoryPercentages.problemSolving >= 60) {
      reportFeedback += `- Good problem-solving skills with room for development\n`;
      reportFeedback += `- Shows potential for analytical thinking\n`;
    } else {
      reportFeedback += `- Needs development in structured problem-solving approaches\n`;
      reportFeedback += `- Would benefit from analytical thinking training\n`;
    }

    reportFeedback += `\nTeamwork: ${categoryPercentages.teamwork}%\n`;
    if (categoryPercentages.teamwork >= 80) {
      reportFeedback += `- Outstanding collaboration and interpersonal skills\n`;
      reportFeedback += `- Excellent understanding of team dynamics\n`;
    } else if (categoryPercentages.teamwork >= 60) {
      reportFeedback += `- Good team collaboration abilities\n`;
      reportFeedback += `- Shows understanding of team-based solutions\n`;
    } else {
      reportFeedback += `- Needs development in team collaboration strategies\n`;
      reportFeedback += `- Would benefit from teamwork and leadership training\n`;
    }

    reportFeedback += `\nCommunication: ${categoryPercentages.communication}%\n`;
    if (categoryPercentages.communication >= 80) {
      reportFeedback += `- Excellent communication and stakeholder management skills\n`;
      reportFeedback += `- Strong understanding of effective communication strategies\n`;
    } else if (categoryPercentages.communication >= 60) {
      reportFeedback += `- Good communication awareness\n`;
      reportFeedback += `- Shows understanding of appropriate communication approaches\n`;
    } else {
      reportFeedback += `- Needs development in communication effectiveness\n`;
      reportFeedback += `- Would benefit from communication skills training\n`;
    }

    reportFeedback += `\nADVANCED ANALYSIS:\n`;
    reportFeedback += `Analytical Reasoning: ${Math.round(this.criticalThinkingMetrics.analyticalReasoning)}%\n`;
    reportFeedback += `Interpersonal Skills: ${Math.round(this.criticalThinkingMetrics.interpersonalSkills)}%\n`;
    reportFeedback += `Communication Effectiveness: ${Math.round(this.criticalThinkingMetrics.communicationEffectiveness)}%\n`;
    reportFeedback += `Decision Making Speed: ${Math.round(this.criticalThinkingMetrics.decisionMakingSpeed)}%\n`;
    reportFeedback += `Consistency Index: ${Math.round(this.criticalThinkingMetrics.consistencyIndex)}%\n\n`;

    reportFeedback += `WORKPLACE SUITABILITY:\n`;
    if (totalScore >= 80) {
      reportFeedback += `HIGHLY RECOMMENDED - Excellent critical thinking abilities suitable for leadership and strategic roles.\n`;
      reportFeedback += `Ideal for: Management positions, strategic planning, complex project leadership, consulting roles.\n`;
    } else if (totalScore >= 65) {
      reportFeedback += `RECOMMENDED - Good critical thinking skills with strong potential for growth.\n`;
      reportFeedback += `Suitable for: Team lead positions, project coordination, analytical roles, client-facing positions.\n`;
    } else if (totalScore >= 50) {
      reportFeedback += `CONDITIONAL - Basic critical thinking skills present, would benefit from structured development.\n`;
      reportFeedback += `Best for: Individual contributor roles with mentorship and training support.\n`;
    } else {
      reportFeedback += `NEEDS DEVELOPMENT - Significant improvement needed in critical thinking and decision-making skills.\n`;
      reportFeedback += `Recommend: Comprehensive training in analytical thinking, communication, and teamwork.\n`;
    }

    reportFeedback += `\nSTRENGTHS & DEVELOPMENT AREAS:\n`;
    const strengths = [];
    const developmentAreas = [];

    if (categoryPercentages.problemSolving >= 70) strengths.push('Analytical problem-solving');
    else developmentAreas.push('Structured problem analysis');

    if (categoryPercentages.teamwork >= 70) strengths.push('Team collaboration');
    else developmentAreas.push('Interpersonal team skills');

    if (categoryPercentages.communication >= 70) strengths.push('Communication effectiveness');
    else developmentAreas.push('Stakeholder communication');

    if (this.criticalThinkingMetrics.decisionMakingSpeed >= 75) strengths.push('Efficient decision-making');
    else developmentAreas.push('Decision-making efficiency');

    if (this.criticalThinkingMetrics.consistencyIndex >= 75) strengths.push('Consistent performance');
    else developmentAreas.push('Performance consistency');

    reportFeedback += `Strengths: ${strengths.join(', ')}\n`;
    reportFeedback += `Development Areas: ${developmentAreas.join(', ')}\n\n`;

    reportFeedback += `DETAILED RESPONSES:\n`;
    this.questions.forEach((question, index) => {
      const userAnswer = this.answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      reportFeedback += `Q${index + 1} (${question.category}): ${isCorrect ? 'Correct' : 'Incorrect'}\n`;
      reportFeedback += `Selected: Option ${userAnswer + 1} - "${question.options[userAnswer]}"\n`;
      if (!isCorrect) {
        reportFeedback += `Correct Answer: Option ${question.correctAnswer + 1} - "${question.options[question.correctAnswer]}"\n`;
      }
      reportFeedback += `\n`;
    });

    return reportFeedback;
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
