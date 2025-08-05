export interface Assessment {
  id?: number;
  hrId: number;
  candidateId: number;
  gameId: number;
  companyId: number;
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED';
  createdAt?: string;
  updatedAt?: string;
  dueDate: string;
}
