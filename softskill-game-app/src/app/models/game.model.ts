
export interface Game {
  id?: number;
  gameName: string;
  gameDescription: string;
  skillName: string;
  gameUrl: string;
  gameImage: string;
  active: boolean;
  gameType: 'CRITICAL_THINKING' | 'MEMORY_FOCUS';
}
