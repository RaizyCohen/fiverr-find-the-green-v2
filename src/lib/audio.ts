// Audio service for game sound effects
class AudioService {
  private isMuted: boolean = false;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds() {
    // Create audio elements for different sounds using Web Audio API
    try {
      // Use Web Audio API to generate simple tones
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a simple beep sound for success
      const createBeep = (frequency: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        return { oscillator, gainNode, duration };
      };
      
      // Store the audio context and beep function
      (this as any).audioContext = audioContext;
      (this as any).createBeep = createBeep;
      
      console.log('Web Audio API initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Web Audio API:', error);
    }
  }



  play(soundName: string) {
    console.log(`AudioService.play(${soundName}) - isMuted: ${this.isMuted}`);
    if (this.isMuted) {
      console.log('Audio is muted, returning early');
      return;
    }
    
    try {
      const audioContext = (this as any).audioContext;
      const createBeep = (this as any).createBeep;
      
      if (!audioContext || !createBeep) {
        console.log('Web Audio API not available');
        return;
      }
      
      // Resume audio context if suspended (required for Chrome)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      let beep: any;
      
      switch (soundName) {
        case 'success':
          beep = createBeep(800, 0.3); // High pitch success sound
          break;
        case 'error':
          beep = createBeep(200, 0.2); // Low pitch error sound
          break;
        case 'click':
          beep = createBeep(400, 0.1); // Medium pitch click
          break;
        case 'powerup':
          beep = createBeep(600, 0.4); // Medium-high powerup sound
          break;
        default:
          console.log(`Unknown sound: ${soundName}`);
          return;
      }
      
      console.log(`Playing ${soundName} sound`);
      
      beep.oscillator.start(audioContext.currentTime);
      beep.oscillator.stop(audioContext.currentTime + beep.duration);
      
      // Clean up after playing
      setTimeout(() => {
        beep.oscillator.disconnect();
        beep.gainNode.disconnect();
      }, beep.duration * 1000);
      
    } catch (error) {
      console.error(`Failed to play sound ${soundName}:`, error);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  isMutedState() {
    return this.isMuted;
  }

  // Test method to manually trigger a sound
  testSound() {
    console.log('Testing audio system...');
    console.log('Current mute state:', this.isMuted);
    console.log('Web Audio API available:', !!(this as any).audioContext);
    this.play('success');
  }
}

export const audioService = new AudioService(); 