import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { leaderboardService } from '@/lib/leaderboard';
import { LeaderboardSubmission } from '@/lib/supabase';

interface LeaderboardSubmissionFormProps {
  finalScore: number;
  totalTime: number;
  bestCombo: number;
  onSubmit: () => void;
  onSkip: () => void;
}

export const LeaderboardSubmissionForm: React.FC<LeaderboardSubmissionFormProps> = ({
  finalScore,
  totalTime,
  bestCombo,
  onSubmit,
  onSkip
}) => {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a username",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const submission: LeaderboardSubmission = {
        username: username.trim(),
        // keep email field for backend schema compatibility; not collected from user
        email: `${username.trim().toLowerCase()}@game.local`,
        score: finalScore,
        total_time: totalTime,
        best_combo: bestCombo
      };

      const result = await leaderboardService.submitScore(submission);

      if (result) {
        toast({
          title: "Score Submitted!",
          description: "Your score has been added to the leaderboard",
        });
        onSubmit();
        setIsSubmitted(true);
      } else {
        toast({
          title: "Submission Failed",
          description: "Unable to submit score. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Unable to submit score. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-game-bg flex items-center justify-center p-4">
      <div className="bg-card border-4 border-primary p-8 pixel-border max-w-md w-full text-center">
        <h1 className="font-pixel text-primary text-2xl mb-6">
          SUBMIT SCORE
        </h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <div className="font-pixel text-sm text-muted-foreground mb-1">FINAL SCORE</div>
            <div className="font-pixel text-3xl text-accent">{finalScore.toLocaleString()}</div>
          </div>
          
          <div>
            <div className="font-pixel text-sm text-muted-foreground mb-1">BEST COMBO</div>
            <div className="font-pixel text-xl text-orange-500">{bestCombo}x</div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="font-pixel text-sm">
              USERNAME
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="font-pixel"
              maxLength={20}
              required
            />
          </div>
          
        </form>
        
        <div className="space-y-3">
          <Button 
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || isSubmitted}
            className="w-full font-pixel text-sm bg-primary hover:bg-primary/80 pixel-border h-12"
          >
            {isSubmitting ? 'SUBMITTING...' : 'SUBMIT SCORE'}
          </Button>
          
          <Button 
            onClick={onSkip}
            variant="outline"
            className="w-full font-pixel text-sm pixel-border h-10"
          >
            VIEW LEADERBOARD
          </Button>
        </div>
      </div>
    </div>
  );
}; 