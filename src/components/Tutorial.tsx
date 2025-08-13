import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Clock, Zap, Target } from 'lucide-react';

interface TutorialProps {
  onComplete: () => void;
}

export const Tutorial: React.FC<TutorialProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Find the Fiverr Logo!',
      content: 'Your goal is to find the green Fiverr logo hidden among the avocados.',
      icon: <Target className="w-8 h-8 text-primary" />
    },
    {
      title: 'How to Play',
      content: 'Click on the Fiverr logo to complete each round. The logo stays still while avocados may move.',
      icon: <Target className="w-8 h-8 text-primary" />
    },
    {
      title: 'Power-ups',
      content: 'Collect power-ups for advantages: Zoom (🔍), Freeze (⏰), and Hint (⚡)',
      icon: <Search className="w-8 h-8 text-accent" />
    },
    {
      title: 'Scoring',
      content: 'Faster completion = higher scores. Build combos for massive bonuses!',
      icon: <Zap className="w-8 h-8 text-orange-500" />
    },
    {
      title: 'Difficulty',
      content: 'Each round gets harder with more objects, faster movement, and smaller targets.',
      icon: <Clock className="w-8 h-8 text-secondary" />
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const skipTutorial = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-game-bg flex items-center justify-center p-4">
      <div className="bg-card border-4 border-primary p-8 pixel-border max-w-md w-full text-center">
        <div className="mb-6">
          {steps[currentStep].icon}
        </div>
        
        <h1 className="font-pixel text-primary text-xl mb-4">
          {steps[currentStep].title}
        </h1>
        
        <p className="font-pixel text-sm text-muted-foreground mb-8">
          {steps[currentStep].content}
        </p>
        
        <div className="flex justify-center mb-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={nextStep}
            className="w-full font-pixel text-xs pixel-border h-10"
          >
            {currentStep === steps.length - 1 ? 'START GAME' : 'NEXT'}
          </Button>
        </div>
        <br/>
        <div className="space-y-3">
          <Button 
            onClick={skipTutorial}
            className="w-full font-pixel text-xs pixel-border h-10"
          >
            SKIP TO MODE
          </Button>
        </div>
        
      </div>
    </div>
  );
}; 