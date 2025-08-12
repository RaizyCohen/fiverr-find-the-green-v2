export interface AccessibilitySettings {
  highContrast: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  screenReader: boolean;
  keyboardNavigation: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  soundEnabled: boolean;
}

export const defaultAccessibilitySettings: AccessibilitySettings = {
  highContrast: false,
  colorBlindMode: 'none',
  screenReader: false,
  keyboardNavigation: false,
  reducedMotion: false,
  largeText: false,
  soundEnabled: true
};

export const accessibilityService = {
  // Get accessibility settings from localStorage
  getSettings(): AccessibilitySettings {
    try {
      const stored = localStorage.getItem('accessibility-settings');
      return stored ? { ...defaultAccessibilitySettings, ...JSON.parse(stored) } : defaultAccessibilitySettings;
    } catch {
      return defaultAccessibilitySettings;
    }
  },

  // Save accessibility settings to localStorage
  saveSettings(settings: AccessibilitySettings): void {
    try {
      localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save accessibility settings:', error);
    }
  },

  // Apply accessibility settings to the document
  applySettings(settings: AccessibilitySettings): void {
    const root = document.documentElement;
    
    // High contrast mode
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Color blind modes
    root.classList.remove('colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia');
    if (settings.colorBlindMode !== 'none') {
      root.classList.add(`colorblind-${settings.colorBlindMode}`);
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Large text
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Screen reader announcements
    if (settings.screenReader) {
      this.announceToScreenReader('Accessibility settings applied');
    }
  },

  // Announce text to screen readers
  announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  // Generate accessible color schemes
  getColorScheme(mode: string): Record<string, string> {
    const schemes = {
      default: {
        primary: '#22c55e',
        secondary: '#64748b',
        accent: '#f59e0b',
        background: '#f8fafc',
        foreground: '#0f172a'
      },
      highContrast: {
        primary: '#ffffff',
        secondary: '#000000',
        accent: '#ffff00',
        background: '#000000',
        foreground: '#ffffff'
      },
      protanopia: {
        primary: '#0066cc',
        secondary: '#666666',
        accent: '#cc6600',
        background: '#f8fafc',
        foreground: '#0f172a'
      },
      deuteranopia: {
        primary: '#0066cc',
        secondary: '#666666',
        accent: '#cc6600',
        background: '#f8fafc',
        foreground: '#0f172a'
      },
      tritanopia: {
        primary: '#cc0066',
        secondary: '#666666',
        accent: '#00cc66',
        background: '#f8fafc',
        foreground: '#0f172a'
      }
    };
    
    return schemes[mode as keyof typeof schemes] || schemes.default;
  }
}; 