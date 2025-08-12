import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { leaderboardService } from '@/lib/leaderboard';
import { LeaderboardEntry } from '@/lib/supabase';
import { Trophy, Medal, Award } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LeaderboardDisplayProps {
  onPlayAgain: () => void;
}

export const LeaderboardDisplay: React.FC<LeaderboardDisplayProps> = ({ onPlayAgain }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const scores = await leaderboardService.getTopScores(10);
        setLeaderboard(scores);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(2);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="font-pixel text-sm text-muted-foreground">#{index + 1}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-game-bg flex items-center justify-center p-4">
      <div className="bg-card border-4 border-primary p-8 pixel-border max-w-2xl w-full text-center">
        <h1 className="font-pixel text-primary text-2xl mb-6">
          LEADERBOARD
        </h1>
        
        {isLoading ? (
          <div className="py-8">
            <div className="font-pixel text-muted-foreground">Loading leaderboard...</div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-8">
            <div className="font-pixel text-muted-foreground mb-4">No scores yet!</div>
            <div className="font-pixel text-sm text-muted-foreground">Be the first to submit a score!</div>
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh] mb-6 pr-2">
            <div className="space-y-4">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 bg-background border-2 border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8">
                      {getRankIcon(index)}
                    </div>
                    <div className="text-left">
                      <div className="font-pixel text-lg text-foreground">{entry.username}</div>
                      <div className="font-pixel text-xs text-muted-foreground">
                        Combo: {entry.best_combo}x | Time: {formatTime(entry.total_time)}s
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-pixel text-xl text-accent">{entry.score.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        <div className="space-y-3">
          <Button 
            onClick={onPlayAgain}
            className="w-full font-pixel text-sm bg-primary hover:bg-primary/80 pixel-border h-12"
          >
            PLAY AGAIN
          </Button>
          
          <div className="font-pixel text-xs text-muted-foreground">
            Top 10 scores are shown. Submit your score to compete!
          </div>
        </div>
      </div>
    </div>
  );
}; 