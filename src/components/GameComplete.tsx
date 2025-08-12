import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LeaderboardSubmissionForm } from './LeaderboardSubmission';
import { LeaderboardDisplay } from './LeaderboardDisplay';

interface GameCompleteProps {
  finalScore: number;
  totalTime: number;
  bestCombo: number;
  onRestart: () => void;
}

export const GameComplete: React.FC<GameCompleteProps> = ({ 
  finalScore, 
  totalTime, 
  bestCombo,
  onRestart 
}) => {

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(2);
  };

  const getPerformanceMessage = () => {
    const avgTime = totalTime / 20000; // Average time per round in seconds (20 rounds)
    
    if (avgTime < 5) return "LEGENDARY! UNSTOPPABLE!";
    if (avgTime < 8) return "INCREDIBLE! LIGHTNING FAST!";
    if (avgTime < 12) return "EXCELLENT! VERY IMPRESSIVE!";
    if (avgTime < 18) return "GREAT JOB! WELL DONE!";
    if (avgTime < 25) return "GOOD WORK! KEEP PRACTICING!";
    return "NICE TRY! TRY AGAIN!";
  };

  if (showLeaderboard) {
    return (
      <LeaderboardDisplay onPlayAgain={onRestart} />
    );
  }

  if (showSubmitForm) {
    return (
      <LeaderboardSubmissionForm finalScore={finalScore} totalTime={totalTime} bestCombo={bestCombo} onSkip={() => setShowLeaderboard(true)} onSubmit={() => setHasSubmitted(true)} />
    );
  }

  if (hasSubmitted) {
    return (
      <div className="min-h-screen bg-game-bg flex items-center justify-center p-4">
        <div className="bg-card border-4 border-primary p-8 pixel-border max-w-md w-full text-center">
          <h1 className="font-pixel text-primary text-2xl mb-6">
            SCORE SUBMITTED!
          </h1>
          
          <div className="space-y-4 mb-6">
            <div className="font-pixel text-sm text-primary bg-primary/10 p-3 pixel-border">
              Your score has been added to the leaderboard!
            </div>
            </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => setShowLeaderboard(true)}
              className="w-full font-pixel text-sm bg-primary hover:bg-primary/80 pixel-border h-12"
            >
              VIEW LEADERBOARD
            </Button>
            
            <Button 
              onClick={onRestart}
              variant="outline"
              className="w-full font-pixel text-sm pixel-border h-10"
            >
              PLAY AGAIN
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-game-bg flex items-center justify-center p-4">
      <div className="bg-card border-4 border-primary p-8 pixel-border max-w-md w-full text-center">
      <h1 className="font-pixel text-primary text-2xl mb-6">
          GAME COMPLETE!
        </h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <div className="font-pixel text-sm text-muted-foreground mb-1">FINAL SCORE</div>
            <div className="font-pixel text-3xl text-accent">{finalScore.toLocaleString()}</div>
          </div>
          
          <div>
            <div className="font-pixel text-sm text-muted-foreground mb-1">TOTAL TIME</div>
            <div className="font-pixel text-2xl text-secondary">{formatTime(totalTime)}s</div>
          </div>
          
          <div>
            <div className="font-pixel text-sm text-muted-foreground mb-1">AVERAGE TIME</div>
            <div className="font-pixel text-xl text-foreground">{formatTime(totalTime / 20)}s</div>
          </div>
          
          <div>
            <div className="font-pixel text-sm text-muted-foreground mb-1">BEST COMBO</div>
            <div className="font-pixel text-xl text-orange-500">{bestCombo}x</div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="font-pixel text-sm text-primary bg-primary/10 p-3 pixel-border">
            {getPerformanceMessage()}
          </div>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={() => setShowLeaderboard(true)}
            className="w-full font-pixel text-sm bg-primary hover:bg-primary/80 pixel-border h-12"
          >
            VIEW LEADERBOARD
          </Button>
          <Button 
            onClick={() => setShowSubmitForm(true)}
            className="w-full font-pixel text-sm bg-primary hover:bg-primary/80 pixel-border h-12"
          >
            SUBMIT YOUR SCORE
          </Button>
          
        
          <Button 
            onClick={onRestart}
            variant="outline"
            className="w-full font-pixel text-sm pixel-border h-10"
          >
            PLAY AGAIN
          </Button>
        </div>
      </div>
    </div>
  );
};