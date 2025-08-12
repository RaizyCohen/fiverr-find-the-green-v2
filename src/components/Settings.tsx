import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { audioService } from '@/lib/audio';
import { accessibilityService } from '@/lib/accessibility';

interface SettingsProps {
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    // Get the current accessibility settings
    const accessibilitySettings = accessibilityService.getSettings();
    return accessibilitySettings.soundEnabled;
  });
  const [particlesEnabled, setParticlesEnabled] = useState(true);

  const handleSoundToggle = () => {
    const newSoundState = !soundEnabled;
    setSoundEnabled(newSoundState);
    
    // Update accessibility settings
    const currentSettings = accessibilityService.getSettings();
    const newSettings = { ...currentSettings, soundEnabled: newSoundState };
    accessibilityService.saveSettings(newSettings);
    
    // Also update audio service to keep them in sync
    audioService.setMuted(!newSoundState);
  };

  return (
    <div className="min-h-screen bg-game-bg flex items-center justify-center p-4">
      <div className="bg-card border-4 border-primary p-8 pixel-border max-w-md w-full text-center">
        <h1 className="font-pixel text-primary text-2xl mb-6">
          SETTINGS
        </h1>
        
        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <Label htmlFor="sound" className="font-pixel text-sm">
              SOUND EFFECTS
            </Label>
            <Switch
              id="sound"
              checked={soundEnabled}
              onCheckedChange={handleSoundToggle}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="particles" className="font-pixel text-sm">
              PARTICLE EFFECTS
            </Label>
            <Switch
              id="particles"
              checked={particlesEnabled}
              onCheckedChange={setParticlesEnabled}
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={onClose}
            className="w-full font-pixel text-sm bg-primary hover:bg-primary/80 pixel-border h-12"
          >
            BACK TO GAME
          </Button>
          
          <div className="font-pixel text-xs text-muted-foreground">
            Settings are saved automatically
          </div>
          
          <Button 
            onClick={() => {
              console.log('TEST SOUND button clicked!');
              audioService.testSound();
            }}
            variant="outline"
            size="sm"
            className="font-pixel text-xs pixel-border mt-4"
          >
            TEST SOUND
          </Button>
        </div>
      </div>
    </div>
  );
}; 