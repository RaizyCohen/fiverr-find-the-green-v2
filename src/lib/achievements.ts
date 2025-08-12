export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  condition: (stats: GameStats) => boolean;
}

export interface GameStats {
  score: number;
  totalTime: number;
  bestCombo: number;
  roundsCompleted: number;
  powerUpsCollected: number;
  mistakes: number;
}

export const achievements: Achievement[] = [
  {
    id: 'first_round',
    title: 'First Steps',
    description: 'Complete your first round',
    icon: '🎯',
    unlocked: false,
    condition: (stats) => stats.roundsCompleted >= 1
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete a round in under 3 seconds',
    icon: '⚡',
    unlocked: false,
    condition: (stats) => stats.totalTime / stats.roundsCompleted < 3000
  },
  {
    id: 'combo_master',
    title: 'Combo Master',
    description: 'Achieve a 10x combo',
    icon: '🔥',
    unlocked: false,
    condition: (stats) => stats.bestCombo >= 10
  },
  {
    id: 'power_player',
    title: 'Power Player',
    description: 'Collect 5 power-ups in one game',
    icon: '💎',
    unlocked: false,
    condition: (stats) => stats.powerUpsCollected >= 5
  },
  {
    id: 'perfect_round',
    title: 'Perfect Round',
    description: 'Complete a round without mistakes',
    icon: '⭐',
    unlocked: false,
    condition: (stats) => stats.mistakes === 0
  },
  {
    id: 'persistent',
    title: 'Persistent',
    description: 'Complete all 20 rounds',
    icon: '🏆',
    unlocked: false,
    condition: (stats) => stats.roundsCompleted >= 20
  },
  {
    id: 'high_scorer',
    title: 'High Scorer',
    description: 'Score over 50,000 points',
    icon: '💰',
    unlocked: false,
    condition: (stats) => stats.score >= 50000
  },
  {
    id: 'efficient',
    title: 'Efficient',
    description: 'Average under 5 seconds per round',
    icon: '⏱️',
    unlocked: false,
    condition: (stats) => stats.totalTime / stats.roundsCompleted < 5000
  }
];

export const checkAchievements = (stats: GameStats): Achievement[] => {
  return achievements.filter(achievement => 
    !achievement.unlocked && achievement.condition(stats)
  );
}; 