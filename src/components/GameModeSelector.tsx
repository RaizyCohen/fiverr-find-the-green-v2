import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play } from 'lucide-react';
import { gameModes, GameMode } from '@/lib/game-modes';
import { useMobile } from '@/hooks/use-mobile';

interface GameModeSelectorProps {
  selectedMode: string;
  onModeSelect: (modeId: string) => void;
  onStart: () => void;
}

export function GameModeSelector({ selectedMode, onModeSelect, onStart }: GameModeSelectorProps) {
  const { isMobile } = useMobile();

  const getDifficultyColor = (difficulty: GameMode['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'normal': return 'bg-blue-500';
      case 'hard': return 'bg-orange-500';
      case 'extreme': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-game-bg p-2 sm:p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            onClick={onStart}
            variant="outline"
            size="sm"
            className="font-pixel text-xs pixel-border"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            BACK
          </Button>
          
          <div className="font-pixel text-primary text-lg sm:text-xl">
            SELECT GAME MODE
          </div>
          
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>

        {/* Game Modes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {gameModes.map((mode) => (
            <Card
              key={mode.id}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 pixel-border ${
                selectedMode === mode.id 
                  ? 'border-primary bg-primary/10' 
                  : 'border-muted-foreground/20 hover:border-primary/50'
              }`}
              onClick={() => onModeSelect(mode.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{mode.icon}</span>
                  <Badge 
                    className={`text-xs ${getDifficultyColor(mode.difficulty)}`}
                  >
                    {mode.difficulty.toUpperCase()}
                  </Badge>
                </div>
                <CardTitle className="font-pixel text-sm sm:text-base">
                  {mode.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground mb-3">
                  {mode.description}
                </p>
                
                <div className="space-y-1 text-xs text-muted-foreground">
                  {mode.modeType === 'rounds' && mode.maxRounds !== Infinity && (
                    <div>• {mode.maxRounds} rounds</div>
                  )}
                  {mode.modeType === 'time' && mode.timeLimit && (
                    <div>• {mode.timeLimit} seconds</div>
                  )}
                  {mode.modeType === 'endless' && (
                    <div>• Endless mode</div>
                  )}
                  {mode.hasPowerUps ? (
                    <div>• Power-ups enabled</div>
                  ) : (
                    <div>• No power-ups</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Start Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={onStart}
            className="font-pixel text-sm bg-primary hover:bg-primary/80 pixel-border h-12 px-8"
            disabled={!selectedMode}
          >
            <Play className="w-4 h-4 mr-2" />
            START {selectedMode ? getGameMode(selectedMode)?.name.toUpperCase() : 'GAME'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function getGameMode(id: string) {
  return gameModes.find(mode => mode.id === id);
} 