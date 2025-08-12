import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { accessibilityService, defaultAccessibilitySettings, type AccessibilitySettings } from '@/lib/accessibility';
import { Eye, Volume2, Keyboard, Monitor, Palette, Type, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccessibilitySettingsComponentProps {
  onClose: () => void;
}

export const AccessibilitySettingsPanel: React.FC<AccessibilitySettingsComponentProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultAccessibilitySettings);
  const { toast } = useToast();

  useEffect(() => {
    const savedSettings = accessibilityService.getSettings();
    setSettings(savedSettings);
    accessibilityService.applySettings(savedSettings);
  }, []);

  const handleSettingChange = (key: keyof AccessibilitySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    accessibilityService.saveSettings(newSettings);
    accessibilityService.applySettings(newSettings);
    
    toast({
      title: "Setting Updated",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} setting has been updated`,
    });
  };


  return (
    <div className="min-h-screen bg-game-bg flex items-center justify-center p-4">
      <div className="bg-card border-4 border-primary p-4 sm:p-8 pixel-border max-w-2xl w-full text-center">
        <h1 className="font-pixel text-primary text-xl sm:text-2xl mb-6">
          ACCESSIBILITY SETTINGS
        </h1>
        
        <div className="space-y-6 mb-8">
          {/* High Contrast Mode */}
          <div className="flex items-center justify-between p-4 bg-background border rounded-lg">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-primary" />
              <div className="text-left">
                <Label htmlFor="high-contrast" className="font-pixel text-sm">
                  HIGH CONTRAST MODE
                </Label>
                <div className="font-pixel text-xs text-muted-foreground">
                  Increases contrast for better visibility
                </div>
              </div>
            </div>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={(checked) => handleSettingChange('highContrast', checked)}
            />
          </div>

          {/* Color Blind Mode */}
          <div className="flex items-center justify-between p-4 bg-background border rounded-lg">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-primary" />
              <div className="text-left">
                <Label htmlFor="color-blind" className="font-pixel text-sm">
                  COLOR BLIND MODE
                </Label>
                <div className="font-pixel text-xs text-muted-foreground">
                  Adjusts colors for color vision deficiency
                </div>
              </div>
            </div>
            <Select
              value={settings.colorBlindMode}
              onValueChange={(value) => handleSettingChange('colorBlindMode', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="protanopia">Protanopia</SelectItem>
                <SelectItem value="deuteranopia">Deuteranopia</SelectItem>
                <SelectItem value="tritanopia">Tritanopia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Screen Reader Support */}
          <div className="flex items-center justify-between p-4 bg-background border rounded-lg">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-primary" />
              <div className="text-left">
                <Label htmlFor="screen-reader" className="font-pixel text-sm">
                  SCREEN READER SUPPORT
                </Label>
                <div className="font-pixel text-xs text-muted-foreground">
                  Enables screen reader announcements
                </div>
              </div>
            </div>
            <Switch
              id="screen-reader"
              checked={settings.screenReader}
              onCheckedChange={(checked) => handleSettingChange('screenReader', checked)}
            />
          </div>

          {/* Keyboard Navigation */}
          <div className="flex items-center justify-between p-4 bg-background border rounded-lg">
            <div className="flex items-center gap-3">
              <Keyboard className="w-5 h-5 text-primary" />
              <div className="text-left">
                <Label htmlFor="keyboard-nav" className="font-pixel text-sm">
                  KEYBOARD NAVIGATION
                </Label>
                <div className="font-pixel text-xs text-muted-foreground">
                  Full keyboard control support
                </div>
              </div>
            </div>
            <Switch
              id="keyboard-nav"
              checked={settings.keyboardNavigation}
              onCheckedChange={(checked) => handleSettingChange('keyboardNavigation', checked)}
            />
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between p-4 bg-background border rounded-lg">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary" />
              <div className="text-left">
                <Label htmlFor="reduced-motion" className="font-pixel text-sm">
                  REDUCED MOTION
                </Label>
                <div className="font-pixel text-xs text-muted-foreground">
                  Reduces animations and motion effects
                </div>
              </div>
            </div>
            <Switch
              id="reduced-motion"
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => handleSettingChange('reducedMotion', checked)}
            />
          </div>

          {/* Large Text */}
          <div className="flex items-center justify-between p-4 bg-background border rounded-lg">
            <div className="flex items-center gap-3">
              <Type className="w-5 h-5 text-primary" />
              <div className="text-left">
                <Label htmlFor="large-text" className="font-pixel text-sm">
                  LARGE TEXT
                </Label>
                <div className="font-pixel text-xs text-muted-foreground">
                  Increases text size for better readability
                </div>
              </div>
            </div>
            <Switch
              id="large-text"
              checked={settings.largeText}
              onCheckedChange={(checked) => handleSettingChange('largeText', checked)}
            />
          </div>

          {/* Sound Effects */}
          <div className="flex items-center justify-between p-4 bg-background border rounded-lg">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-primary" />
              <div className="text-left">
                <Label htmlFor="sound-effects" className="font-pixel text-sm">
                  SOUND EFFECTS
                </Label>
                <div className="font-pixel text-xs text-muted-foreground">
                  Enable or disable game sound effects
                </div>
              </div>
            </div>
            <Switch
              id="sound-effects"
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
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
            Settings are saved automatically and persist between sessions
          </div>
        </div>
      </div>
    </div>
  );
}; 