export interface Score {
  scoreId?: number;
  assessmentId: number;
  candidateId: number;
  score: string;
  feedback: string;
  completedAt?: string;
  gameData?: string;
}
