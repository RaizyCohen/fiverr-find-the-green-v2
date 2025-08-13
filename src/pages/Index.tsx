import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GameField } from '@/components/GameField';
import { GameUI } from '@/components/GameUI';
import { GameComplete } from '@/components/GameComplete';
import { GameModeSelector } from '@/components/GameModeSelector';
import { Settings } from '@/components/Settings';
import { AccessibilitySettingsPanel } from '@/components/AccessibilitySettings';
import { Tutorial } from '@/components/Tutorial';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, HelpCircle, Trophy, Accessibility, Dices, Send } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';
import { getGameMode } from '@/lib/game-modes';
import { audioService } from '@/lib/audio';
import { accessibilityService } from '@/lib/accessibility';
import fiverrLogo from '@/assets/fiverr_logo_RGB.png';
import { LeaderboardDisplay } from '@/components/LeaderboardDisplay';
import { LeaderboardSubmissionForm } from '@/components/LeaderboardSubmission';

type GameState = 'menu' | 'mode-select' | 'tutorial' | 'intro' | 'playing' | 'complete' | 'settings' | 'accessibility' | 'leaderboard' | 'submit';

export default function Index() {
  const { isMobile } = useMobile();
  const [gameState, setGameState] = useState<GameState>('tutorial');
  const [selectedGameMode, setSelectedGameMode] = useState('classic');
  const [currentRound, setCurrentRound] = useState(1);
  const [score, setScore] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [introStage, setIntroStage] = useState<'large' | 'shrinking' | 'playing'>('large');
  const [timeRemaining, setTimeRemaining] = useState<number | undefined>(undefined);
  const [submissionSnapshot, setSubmissionSnapshot] = useState<{ score: number; totalTime: number; bestCombo: number } | null>(null);

  const [compact, setCompact] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      const fits = el.scrollWidth <= el.clientWidth;
      setCompact(!fits);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Initialize accessibility settings
  useEffect(() => {
    const settings = accessibilityService.getSettings();
    accessibilityService.applySettings(settings);
  }, []);

  const calculateScore = useCallback((roundTime: number, currentCombo: number) => {
    const baseScore = Math.max(1000 - roundTime, 100);
    const comboBonus = Math.pow(1.2, currentCombo);
    const roundBonus = Math.pow(1.1, currentRound);
    return Math.floor(baseScore * comboBonus * roundBonus)}, [currentRound]);


  
  const startIntro = useCallback(() => {
    setGameState('intro');
    setIntroStage('large');
    
    setTimeout(() => {
      setIntroStage('shrinking');
      setTimeout(() => {
        setIntroStage('playing');
        setGameState('playing');
        setStartTime(Date.now());
      }, 1000);
    }, 2000);
  }, []);

  // Unified UI time state that is always updated while playing
  const [displayTimeMs, setDisplayTimeMs] = useState(0);
  const timeModeRef = useRef<number>(0);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const mode = getGameMode(selectedGameMode);

    // Time modes: countdown using interval
    if (mode?.modeType === 'time') {
      timeModeRef.current = typeof timeRemaining === 'number'
        ? timeRemaining
        : (mode.timeLimit ? mode.timeLimit * 1000 : 0);
      setDisplayTimeMs(timeModeRef.current);

      const interval = setInterval(() => {
        const next = Math.max(timeModeRef.current - 100, 0);
        timeModeRef.current = next;
        setTimeRemaining(next);
        setDisplayTimeMs(next);
        if (next <= 0) {
          clearInterval(interval);
          setGameState('complete');
        }
      }, 100);
      return () => clearInterval(interval);
    }

    // Classic/rounds: update with requestAnimationFrame for smooth stopwatch
    let raf = 0;
    const loop = () => {
      setDisplayTimeMs(totalTime + Math.max(Date.now() - startTime, 0));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [gameState, selectedGameMode, startTime, totalTime, timeRemaining]);

  const startGame = useCallback(() => {
    const currentGameMode = getGameMode(selectedGameMode);
    setCurrentRound(1);
    setScore(0);
    setTotalTime(0);
    setCombo(0);
    setBestCombo(0);
    setStartTime(0);
    
    // Set up time-based mode
    if (currentGameMode?.modeType === 'time' && currentGameMode.timeLimit) {
      setTimeRemaining(currentGameMode.timeLimit * 1000);
      setDisplayTimeMs(currentGameMode.timeLimit * 1000);
    } else {
      setTimeRemaining(undefined);
      setDisplayTimeMs(0);
    }
    
    startIntro();
  }, [startIntro, selectedGameMode]);

    // Add leaderboard handler
  const handleShowLeaderboard = useCallback(() => {
    setGameState('leaderboard');
  }, []);

  const handleRoundComplete = useCallback((roundTime: number) => {
    const roundScore = calculateScore(roundTime, combo);
    setScore(prev => prev + roundScore);
    setTotalTime(prev => prev + roundTime);
    setCombo(prev => prev + 1);
    setBestCombo(prev => Math.max(prev, combo + 1));
    
    const currentGameMode = getGameMode(selectedGameMode);
    
    if (currentGameMode?.modeType === 'time') {
      // For time-based modes, continue until time runs out
      setCurrentRound(prev => prev + 1);
      setStartTime(Date.now());
    } else if (currentRound < (currentGameMode?.maxRounds || 20)) {
      setCurrentRound(prev => prev + 1);
      setStartTime(Date.now());
    } else {
      setGameState('complete');
    }
  }, [calculateScore, combo, currentRound, selectedGameMode]);

  const handleGameComplete = useCallback(() => {
    setGameState('complete');
  }, []);

  const handleEarlyComplete = useCallback(() => {
    setGameState('complete');
  }, []);

  const handleEndAndSubmit = useCallback(() => {
    const mode = getGameMode(selectedGameMode);
    let computedTotalTime = 0;
    if (mode?.modeType === 'time') {
      const limitMs = (mode.timeLimit ?? 0) * 1000;
      const remainingMs = typeof timeRemaining === 'number' ? timeRemaining : displayTimeMs;
      computedTotalTime = Math.max(limitMs - Math.max(remainingMs, 0), 0);
    } else {
      // For classic, displayTimeMs already equals totalTime + current round elapsed
      computedTotalTime = Math.max(displayTimeMs, 0);
    }
    setSubmissionSnapshot({ score, totalTime: computedTotalTime, bestCombo });
    setGameState('submit');
  }, [bestCombo, displayTimeMs, score, selectedGameMode, timeRemaining]);

  const handleTimeUpdate = useCallback((newTime: number) => {
    setTimeRemaining(newTime);
  }, []);

  const restartGame = useCallback(() => {
    setGameState('menu');
    setCurrentRound(1);
    setScore(0);
    setTotalTime(0);
    setCombo(0);
    setBestCombo(0);
    setStartTime(0);
    setTimeRemaining(undefined);
  }, []);

  const handleModeSelect = useCallback((modeId: string) => {
    setSelectedGameMode(modeId);
  }, []);

  const handleStartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  const handleTutorialComplete = useCallback(() => {
    // After the multi-page intro, route to mode select and prep timers for selected mode
    const currentGameMode = getGameMode(selectedGameMode);
    if (currentGameMode?.modeType === 'time' && currentGameMode.timeLimit) {
      setTimeRemaining(currentGameMode.timeLimit * 1000);
      setDisplayTimeMs(currentGameMode.timeLimit * 1000);
    } else {
      setTimeRemaining(undefined);
      setDisplayTimeMs(0);
    }
    setGameState('mode-select');
  }, [selectedGameMode]);

  const handleSetGameMode = useCallback(() => {
    setGameState('mode-select');
  }, []);

  const handleSettingsClose = useCallback(() => {
    setGameState('menu');
  }, []);

  const handleAccessibilityClose = useCallback(() => {
    setGameState('menu');
  }, []);

  const handleNavToModeScreen = useCallback(() => {
    setGameState('mode-select');
    setSelectedGameMode('classic');
  }, []);

  // Play sound effects
  useEffect(() => {
    const settings = accessibilityService.getSettings();
    if (gameState === 'playing' && settings.soundEnabled) {
      audioService.play('click');
    }
  }, [gameState]);

  const currentGameMode = getGameMode(selectedGameMode);
  const uiTimeMs = currentGameMode?.modeType === 'time'
    ? Math.max(displayTimeMs, 0)
    : displayTimeMs;

  if (gameState === 'tutorial') {
    return <Tutorial onComplete={handleTutorialComplete} />;
  }

  if (gameState === 'settings') {
    return <Settings onClose={handleSettingsClose} />;
  }

  if (gameState === 'accessibility') {
    return <AccessibilitySettingsPanel onClose={handleAccessibilityClose} />;
  }

  // Add leaderboard state handling
  if (gameState === 'leaderboard') {
    return (
      <LeaderboardDisplay onPlayAgain={() => setGameState('menu')} />
    );
  }

  if (gameState === 'submit') {
    const snapshot = submissionSnapshot ?? { score, totalTime, bestCombo };
    return (
      <LeaderboardSubmissionForm
        finalScore={snapshot.score}
        totalTime={snapshot.totalTime}
        bestCombo={snapshot.bestCombo}
        onSubmit={() => setGameState('leaderboard')}
        onSkip={() => setGameState('leaderboard')}
      />
    );
  }


  if (gameState === 'mode-select') {
    return (
      <GameModeSelector
        selectedMode={selectedGameMode}
        onModeSelect={handleModeSelect}
        onStart={handleStartGame}
      />
    );
  }

  if (gameState === 'intro') {
    return (
      <div className="min-h-screen bg-game-bg flex items-center justify-center p-4">
        <div className="text-center">
          <div 
            className={`transition-all duration-1000 ${
              introStage === 'large' ? 'scale-100' : 
              introStage === 'shrinking' ? 'scale-50' : 'scale-25'
            }`}
          >
            <img 
              src={fiverrLogo} 
              alt="Fiverr Logo"
              className="w-32 h-32 sm:w-48 sm:h-48 object-contain"
            />
          </div>
          <div className="font-pixel text-primary text-lg sm:text-xl mt-4">
            {introStage === 'large' ? 'FIND THE LOGO!' : 
             introStage === 'shrinking' ? 'GET READY...' : 'GO!'}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'complete') {
    return (
      <GameComplete
        finalScore={score}
        totalTime={totalTime}
        bestCombo={bestCombo}
        onRestart={restartGame}
      />
    );
  }

  return (
    
    <div className="min-h-screen bg-game-bg p-2 sm:p-4">
      <div className="max-w-4xl mx-auto space-y-2 sm:space-y-4">
        {/* Header with mobile-responsive buttons */}
        {/* <div className="flex items-center justify-between"> */}
            <div ref={headerRef} className="flex items-center justify-between gap-1 overflow-hidden">

          <div className="font-pixel text-primary text-lg sm:text-xl">
            FIND THE LOGO
          </div>
          
          <div className="flex gap-1 sm:gap-2 flex-wrap justify-end">
          {(gameState === 'playing' || gameState === 'menu') && (
              <Button
                onClick={handleEndAndSubmit}
                variant="outline"
                size="sm"
                className="font-pixel text-xs pixel-border"
                aria-label="End and submit score"
              >
                <Send className="w-3 h-3 mr-1" />
                {!isMobile && 'END & SUBMIT'}
              </Button>
            )}
          <Button
            onClick={handleShowLeaderboard}
            variant="outline"
            size="sm"
            className="font-pixel text-xs pixel-border"
            aria-label="View leaderboard"
          >
            <Trophy className="w-3 h-3 mr-1" />
            {!isMobile && 'LEADERBOARD'}
          </Button>
          <Button
              onClick={() => setGameState('tutorial')}
              variant="outline"
              size="sm"
              className="font-pixel text-xs pixel-border"
              aria-label="Help and tutorial"
            >
              <HelpCircle className="w-3 h-3 mr-1" />
              {!isMobile && 'HOW TO PLAY'}
            </Button>
          <Button
              onClick={() => handleNavToModeScreen()}
              variant="outline"
              size="sm"
              className="font-pixel text-xs pixel-border"
              aria-label="Mode Selection"
            >
              <Dices className="w-3 h-3 mr-1" />
              {!isMobile && 'GAME MODES'}
            </Button>
           
            
            <Button
              onClick={() => setGameState('accessibility')}
              variant="outline"
              size="sm"
              className="font-pixel text-xs pixel-border"
              aria-label="Accessibility settings"
            >
              <Accessibility className="w-3 h-3 mr-1" />
              {!isMobile && 'ACCESS'}
            </Button>
            
            <Button
              onClick={() => setGameState('settings')}
              variant="outline"
              size="sm"
              className="font-pixel text-xs pixel-border"
              aria-label="Game settings"
            >
              <SettingsIcon className="w-3 h-3 mr-1" />
              {!isMobile && 'SETTINGS'}
            </Button>
          </div>
        </div>

        <GameUI
          round={currentRound}
          score={score}
          totalTime={uiTimeMs}
          combo={combo}
          isPlaying={gameState === 'playing'}
        />

        <div className="aspect-square w-full max-w-2xl mx-auto">
          <GameField
            round={currentRound}
            onRoundComplete={handleRoundComplete}
            onGameComplete={handleGameComplete}
            gameMode={selectedGameMode}
            timeRemaining={timeRemaining}
            onTimeUpdate={handleTimeUpdate}
          />
        </div>

        {/* Game Menu */}
        {gameState === 'menu' || gameState === 'playing' && (
          <div className="bg-card border-4 border-primary p-4 sm:p-8 pixel-border text-center">
            <div className="font-pixel mb-6">
              <div className="text-primary text-2xl sm:text-3xl leading-none">FIND THE</div>
              <div className="text-orange-500 text-xl sm:text-2xl mt-2">FIVERR LOGO</div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="font-pixel text-sm text-muted-foreground space-y-2 text-left inline-block">
                <div>• Find the green Fiverr logo among the avocados</div>
                <div>• 10 rounds of increasing difficulty</div>
                <div>• Faster finds = higher scores</div>
                <div>• Objects start moving in round 4</div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => setGameState('mode-select')}
                className="w-full font-pixel text-sm bg-primary hover:bg-primary/80 pixel-border h-12"
                aria-label="Start game and select mode"
              >
                <Trophy className="w-4 h-4 mr-2" />
                SELECT MODE TO RESTART GAME
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
