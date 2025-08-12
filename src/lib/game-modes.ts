export interface GameMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  maxRounds: number;
  timeLimit?: number; // in seconds
  hasPowerUps: boolean;
  difficulty: 'easy' | 'normal' | 'hard' | 'extreme';
  modeType: 'rounds' | 'time' | 'endless';
}

export const gameModes: GameMode[] = [
  {
    id: 'classic',
    name: 'Classic Mode',
    description: 'Stopwatch counts up while you play',
    icon: '🎯',
    maxRounds: 20,
    hasPowerUps: true,
    difficulty: 'normal',
    modeType: 'rounds'
  },
  {
    id: 'time-trial',
    name: 'Time Trial',
    description: 'Complete as many rounds as possible in 1 minute',
    icon: '⏱️',
    maxRounds: Infinity,
    timeLimit: 60, // 1 minute total
    hasPowerUps: true,
    difficulty: 'hard',
    modeType: 'time'
  }
];

export const getGameMode = (id: string): GameMode | undefined => {
  return gameModes.find(mode => mode.id === id);
}; 