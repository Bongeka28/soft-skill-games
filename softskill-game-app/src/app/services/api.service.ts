import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Company } from '../models/user.model';
import { Game } from '../models/game.model';
import { Assessment } from '../models/assessment.model';
import { Score } from '../models/score.model';
import { Report } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  // User endpoints
  login(credentials: { email: string; password: string }): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users/login`, credentials);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, user);
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/email/${email}`);
  }

  // Company endpoints
  getAllCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/companies`);
  }

  createCompany(company: Company): Observable<Company> {
    return this.http.post<Company>(`${this.baseUrl}/companies`, company);
  }

  // Game endpoints

  createGame(game: Game): Observable<Game> {
    return this.http.post<Game>(`${this.baseUrl}/games`, game);
  }
  getAllGames(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.baseUrl}/games`);
  }

  getActiveGames(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.baseUrl}/games/active`);
  }

  getGameById(id: number): Observable<Game> {
    return this.http.get<Game>(`${this.baseUrl}/games/${id}`);
  }

  // Assessment endpoints
  createAssessment(assessment: Assessment): Observable<Assessment> {
    return this.http.post<Assessment>(`${this.baseUrl}/assessments`, assessment);
  }

  getAssessmentsByCandidateId(candidateId: number): Observable<Assessment[]> {
    return this.http.get<Assessment[]>(`${this.baseUrl}/assessments/candidate/${candidateId}`);
  }

  getAssessmentsByHrId(hrId: number): Observable<Assessment[]> {
    return this.http.get<Assessment[]>(`${this.baseUrl}/assessments/hr/${hrId}`);
  }

  updateAssessment(id: number, assessment: Assessment): Observable<Assessment> {
    return this.http.put<Assessment>(`${this.baseUrl}/assessments/${id}`, assessment);
  }

  // Score endpoints
  createScore(score: Score): Observable<Score> {
    return this.http.post<Score>(`${this.baseUrl}/scores`, score);
  }

  getScoresByHrId(hrId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/reports/user/${hrId}`);
  }

  // Report endpoints
  createReport(report: Report): Observable<Report> {
    return this.http.post<Report>(`${this.baseUrl}/reports`, report);
  }

  getReportsByUserId(userId: number): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.baseUrl}/reports/user/${userId}`);
  }



}
