import arcadeMusic from '../assets/arcade_music.mp3';

class AudioService {
  private isMuted: boolean = false;
  private backgroundAudio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private createBeep: ((frequency: number, duration: number) => any) | null = null;

  constructor() {
    this.initializeSounds();
    this.initializeBackgroundMusic();
  }

  private initializeSounds() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      this.createBeep = (frequency: number, duration: number) => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, this.audioContext!.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + duration);

        return { oscillator, gainNode, duration };
      };

      console.log('Web Audio API initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Web Audio API:', error);
    }
  }

  private initializeBackgroundMusic() {
    this.backgroundAudio = new Audio(arcadeMusic); 
    this.backgroundAudio.loop = true;
    this.backgroundAudio.volume = 0.4; // softer than SFX
  }

  enableBackgroundMusic() {
    if (this.backgroundAudio && !this.isMuted) {
      // Required for browsers: must start after a user gesture
      this.backgroundAudio.play().catch(err => console.warn('Music autoplay blocked:', err));
    }
  }

  stopBackgroundMusic() {
    if (this.backgroundAudio) {
      this.backgroundAudio.pause();
      this.backgroundAudio.currentTime = 0;
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
  
    if (this.backgroundAudio) {
      this.backgroundAudio.volume = this.isMuted ? 0 : 0.4; // 0.4 is your normal volume
    }
  }


  play(soundName: string) {
    if (this.isMuted || !this.audioContext || !this.createBeep) return;

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    let beep;
    switch (soundName) {
      case 'success': beep = this.createBeep(800, 0.3); break;
      case 'error':   beep = this.createBeep(200, 0.2); break;
      case 'click':   beep = this.createBeep(400, 0.1); break;
      case 'powerup': beep = this.createBeep(600, 0.4); break;
      default: return;
    }

    beep.oscillator.start(this.audioContext.currentTime);
    beep.oscillator.stop(this.audioContext.currentTime + beep.duration);

    setTimeout(() => {
      beep.oscillator.disconnect();
      beep.gainNode.disconnect();
    }, beep.duration * 1000);
  }
  
  toggleMute() {
    this.isMuted = !this.isMuted;
  
    // Handle background music when toggled
    if (this.backgroundAudio) {
      if (this.isMuted) {
        this.backgroundAudio.pause();
      } else {
        this.backgroundAudio.play().catch(err =>
          console.warn('Music autoplay blocked:', err)
        );
      }
    }
  
    return this.isMuted;
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
