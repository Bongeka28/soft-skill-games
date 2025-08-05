import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Game} from '../../models/game.model';
import {User} from '../../models/user.model';
import {Report} from '../../models/report.model';
import {ApiService} from '../../services/api.service';
import {AuthService} from '../../services/auth.service';
import {Assessment} from '../../models/assessment.model';

@Component({
  selector: 'app-recruiter-dashboard',
  imports: [CommonModule,FormsModule],
  templateUrl: './recruiter-dashboard.component.html',
  styleUrl: './recruiter-dashboard.component.css'
})
export class RecruiterDashboardComponent implements OnInit{
  games: Game[] = [];
  reports: Report[] = [];
  currentUser: User | null = null;

  // Modal states
  showCreateAssessmentModal = false;
  showReportDetailsModal = false;
  selectedGame: Game | null = null;
  selectedReport: Report | null = null;
  candidateEmail = '';
  dueDate = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.loadGames();
    this.loadReports();
  }

  loadGames() {
    this.apiService.getActiveGames().subscribe({
      next: (games) => {
        this.games = games;
      },
      error: (error) => {
        console.error('Error loading games:', error);
      }
    });
  }

  loadReports() {
    if (this.currentUser?.id) {
      this.apiService.getReportsByUserId(this.currentUser.id).subscribe({
        next: (reports) => {
          this.reports = reports;
        },
        error: (error) => {
          console.error('Error loading reports:', error);
        }
      });
    }
  }

  openCreateAssessmentModal(game: Game) {
    this.selectedGame = game;
    this.showCreateAssessmentModal = true;
    this.candidateEmail = '';
    this.dueDate = '';
  }

  closeCreateAssessmentModal() {
    this.showCreateAssessmentModal = false;
    this.selectedGame = null;
  }

  createAssessment() {
    if (!this.candidateEmail || !this.dueDate || !this.selectedGame || !this.currentUser) {
      return;
    }

    // First, get candidate by email
    this.apiService.getUserByEmail(this.candidateEmail).subscribe({
      next: (candidate) => {
        const assessment: Assessment = {
          hrId: this.currentUser!.id!,
          candidateId: candidate.id!,
          gameId: this.selectedGame!.id!,
          companyId: this.currentUser!.company?.id!,
          status: 'PENDING',
          dueDate: this.dueDate
        };

        this.apiService.createAssessment(assessment).subscribe({
          next: (result) => {
            console.log('Assessment created successfully:', result);
            this.closeCreateAssessmentModal();
            alert('Assessment created successfully!');
          },
          error: (error) => {
            console.error('Error creating assessment:', error);
            alert('Failed to create assessment. Please try again.');
          }
        });
      },
      error: (error) => {
        console.error('Error finding candidate:', error);
        alert('Candidate not found with this email address.');
      }
    });
  }

  viewReportDetails(report: Report) {
    this.selectedReport = report;
    this.showReportDetailsModal = true;
  }

  closeReportDetailsModal() {
    this.showReportDetailsModal = false;
    this.selectedReport = null;
  }

}
