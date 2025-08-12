import React from 'react';
import { useMobile } from '@/hooks/use-mobile';


interface GameUIProps {
  round: number;
  score: number;
  totalTime: number;
  combo: number;
  isPlaying: boolean;
}

export const GameUI: React.FC<GameUIProps> = ({ round, score, totalTime, combo, isPlaying }) => {
  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(2);
  };

  const { isMobile, isSmallScreen } = useMobile();


  return (
    <div className="w-full bg-card border-4 border-primary p-4 pixel-border">
      <div className="grid grid-cols-4 gap-4 text-center">
        <div>
          <div className={`font-pixel text-muted-foreground mb-1 ${
      isMobile ? 'text-xs' : 'text-sm'
    }`}>ROUND</div>
          <div className="font-pixel text-2xl text-primary">{round}/20</div>
        </div>
        
        <div>
          <div className="font-pixel text-sm text-muted-foreground mb-1">SCORE</div>
          <div className="font-pixel text-2xl text-black-500">{score.toLocaleString()}</div>
        </div>
        
        <div>
          <div className="font-pixel text-sm text-muted-foreground mb-1">TIME</div>
          <div className="font-pixel text-2xl text-black-500">{formatTime(totalTime)}s</div>
        </div>
        
        <div>
          <div className="font-pixel text-sm text-muted-foreground mb-1">COMBO</div>
          <div className="font-pixel text-2xl text-orange-500">{combo}x</div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <div className="font-pixel text-xs text-muted-foreground">
        Click on the Fiverr logo among the avocados!
        </div>
      </div>
    </div>
  );
};