export interface Report {
  reportId?: number;
  userId: number;
  scoreId: number;
  fullname: string;
  email: string;
  score: string;
  skillType: string;
  feedback: string;
  createdAt?: string;
}
