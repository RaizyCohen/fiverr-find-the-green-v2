import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import fiverrLogo from '@/assets/fiverr_logo_RGB.png';
import { Search, Clock, Zap } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';
import { accessibilityService } from '@/lib/accessibility';
import { getGameMode } from '@/lib/game-modes';
import { audioService } from '@/lib/audio';
import { AdaptedAvocadoIcon } from '@/components/ui/avocadoIcon';

interface GameObject {
  id: string;
  x: number;
  y: number;
  isTarget: boolean;
  velocityX?: number;
  velocityY?: number;
  size?: number; // Dynamic size for objects
  colorVariation?: number; // Color variation for avocados
}

interface PowerUp {
  id: string;
  type: 'zoom' | 'freeze' | 'hint';
  x: number;
  y: number;
  collected: boolean;
  isSidePanel?: boolean; // Added for side panel powerups
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface GameFieldProps {
  round: number;
  onRoundComplete: (timeMs: number) => void;
  onGameComplete: () => void;
  gameMode?: string;
  timeRemaining?: number; // For time-based modes
  onTimeUpdate?: (timeRemaining: number) => void;
}

export const GameField: React.FC<GameFieldProps> = ({
  round,
  onRoundComplete,
  onGameComplete,
  gameMode = 'classic',
  timeRemaining,
  onTimeUpdate
}) => {
  const { isMobile, isSmallScreen } = useMobile();
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [sidePanelPowerUps, setSidePanelPowerUps] = useState<PowerUp[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [foundTarget, setFoundTarget] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [zoomScale, setZoomScale] = useState(1);
  const isMultiTouch = useRef(false);

  const { toast } = useToast();
  const accessibilitySettings = accessibilityService.getSettings();

  // Add refs and state for pinch zoom:
  const pinchRef = React.useRef<HTMLDivElement | null>(null);
  const lastDistance = React.useRef<number | null>(null);

  function getDistance(touch1: Touch, touch2: Touch) {
    return Math.hypot(touch2.pageX - touch1.pageX, touch2.pageY - touch1.pageY);
  }
  useEffect(() => {
    const container = pinchRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        isMultiTouch.current = true;
        lastDistance.current = getDistance(e.touches[0], e.touches[1]);
      } else if (e.touches.length === 1) {
        isMultiTouch.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && lastDistance.current) {
        const dist = getDistance(e.touches[0], e.touches[1]);
        const scaleChange = dist / lastDistance.current;
        const newScale = Math.min(Math.max(1, zoomScale * scaleChange), 3);
        setZoomScale(newScale);
        lastDistance.current = dist;
        e.preventDefault(); // Prevent scrolling the page while zooming
      }
    };



    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        isMultiTouch.current = false;
        lastDistance.current = null;
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [zoomScale]);

  // Adjust difficulty based on screen size and accessibility
  const getDifficulty = useCallback(() => {
    const baseObjects = isMobile ? 15 : 20;
    const objectCount = Math.min(
      Math.floor(baseObjects * Math.pow(1.6, round - 1)),
      isMobile ? 150 : 200
    );

    const movementSpeed = Math.min(5 * Math.pow(1.8, round - 1), 50);
    const targetSize = Math.max(50 - round * 2.5, isMobile ? 15 : 10);
    const avocadoSize = Math.max(35 - round * 1.2, isMobile ? 20 : 15);
    const hasMovement = round > 0;

    // Adjust for accessibility settings
    const finalTargetSize = accessibilitySettings.largeText ? targetSize * 1.2 : targetSize;
    const finalMovementSpeed = accessibilitySettings.reducedMotion ? movementSpeed * 0.5 : movementSpeed;

    return {
      objectCount,
      movementSpeed: finalMovementSpeed,
      targetSize: finalTargetSize,
      avocadoSize,
      hasMovement
    };
  }, [round, isMobile, accessibilitySettings.largeText, accessibilitySettings.reducedMotion]);

  // Create particle explosion effect
  const createParticleExplosion = useCallback((x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      newParticles.push({
        id: `particle-${Date.now()}-${i}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 60,
        maxLife: 60
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Generate power-ups
  const generatePowerUps = useCallback(() => {
    const powerUpTypes: PowerUp['type'][] = ['zoom', 'freeze', 'hint'];
    const newPowerUps: PowerUp[] = [];

    // Add 1-2 power-ups per round
    const powerUpCount = Math.min(2, Math.floor(round / 5) + 1);

    for (let i = 0; i < powerUpCount; i++) {
      newPowerUps.push({
        id: `powerup-${i}`,
        type: powerUpTypes[i % powerUpTypes.length],
        x: Math.random() * 85 + 5,
        y: Math.random() * 85 + 5,
        collected: false
      });
    }

    setPowerUps(newPowerUps);
  }, [round]);

  // Generate side panel powerups (always available)
  const generateSidePanelPowerUps = useCallback(() => {
    return [
      {
        id: 'side-zoom',
        type: 'zoom' as const,
        x: 0, // Will be positioned on the right side
        y: 0, // Will be positioned on the right side
        collected: false,
        isSidePanel: true
      },
      {
        id: 'side-freeze',
        type: 'freeze' as const,
        x: 0, // Will be positioned on the right side
        y: 0, // Will be positioned on the right side
        collected: false,
        isSidePanel: true
      },
      {
        id: 'side-hint',
        type: 'hint' as const,
        x: 0, // Will be positioned on the right side
        y: 0, // Will be positioned on the right side
        collected: false,
        isSidePanel: true
      }
    ];
  }, []);

  // Generate random positions for objects
  const generateObjects = useCallback(() => {
    const { objectCount, targetSize, avocadoSize } = getDifficulty();
    const newObjects: GameObject[] = [];

    // Create avocados with size and color variation
    for (let i = 0; i < objectCount - 1; i++) {
      // Add random size variation to avocados
      const sizeVariation = 0.7 + Math.random() * 0.6; // 0.7 to 1.3 multiplier
      const finalAvocadoSize = avocadoSize * sizeVariation;

      // Add color variation
      const colorVariation = Math.random(); // 0 to 1 for different shades

      newObjects.push({
        id: `avocado-${i}`,
        x: Math.random() * 85 + 5, // 5-90% to keep within bounds
        y: Math.random() * 85 + 5,
        isTarget: false,
        velocityX: Math.random() * 2 - 1, // Random velocity
        velocityY: Math.random() * 2 - 1,
        size: finalAvocadoSize,
        colorVariation
      });
    }

    // Add the Fiverr logo target (STATIONARY)
    newObjects.push({
      id: 'fiverr-target',
      x: Math.random() * 85 + 5,
      y: Math.random() * 85 + 5,
      isTarget: true,
      size: targetSize
      // No velocity - target stays stationary
    });

    setObjects(newObjects);
  }, [getDifficulty]);

  // Start round
  const startRound = useCallback(() => {
    generateObjects();
    generatePowerUps();
    setSidePanelPowerUps(generateSidePanelPowerUps());
    setStartTime(Date.now());
    setIsPlaying(true);
    setFoundTarget(false);
    setIsFrozen(false);
    setIsZoomed(false);
    setHintUsed(false);
    setParticles([]);
  }, [generateObjects, generatePowerUps, generateSidePanelPowerUps]);

  // Reset side panel powerups when round starts
  useEffect(() => {
    if (isPlaying && !foundTarget) {
      setSidePanelPowerUps(prev => prev.map(p => ({ ...p, collected: false })));
    }
  }, [isPlaying, foundTarget]);

  // Handle power-up collection
  const handlePowerUpClick = useCallback((powerUp: PowerUp) => {
    if (!isPlaying || foundTarget) return;

    // Handle side panel powerups differently
    if (powerUp.isSidePanel) {
      // Reset side panel powerup after use
      setSidePanelPowerUps(prev => prev.map(p =>
        p.id === powerUp.id ? { ...p, collected: false } : p
      ));

      // Create particle effect at center of screen for side panel powerups
      createParticleExplosion(50, 50, '#10b981');
    } else {
      // Regular powerups get collected
      setPowerUps(prev => prev.map(p =>
        p.id === powerUp.id ? { ...p, collected: true } : p
      ));

      // Create particle effect at powerup location
      createParticleExplosion(powerUp.x, powerUp.y, '#10b981');
    }

    switch (powerUp.type) {
      case 'zoom':
        setIsZoomed(true);
        toast({
          title: "ZOOM ACTIVATED!",
          description: "Objects are now larger for 5 seconds!",
        });
        setTimeout(() => setIsZoomed(false), 5000);
        break;
      case 'freeze':
        setIsFrozen(true);
        toast({
          title: "TIME FREEZE!",
          description: "All movement stopped for 3 seconds!",
        });
        setTimeout(() => setIsFrozen(false), 3000);
        break;
      case 'hint':
        setHintUsed(true);
        const target = objects.find(obj => obj.isTarget);
        if (target) {
          toast({
            title: "HINT ACTIVATED!",
            description: `The Fiverr logo is in the ${target.x > 50 ? 'right' : 'left'} ${target.y > 50 ? 'bottom' : 'top'} area!`,
          });
        }
        break;
    }
  }, [isPlaying, foundTarget, objects, toast, createParticleExplosion]);

  // Handle object click
  const handleObjectClick = useCallback((object: GameObject) => {
    if (!isPlaying || foundTarget || isMultiTouch.current) return;
    if (object.isTarget) {
      const timeMs = Date.now() - startTime;
      setFoundTarget(true);
      setIsPlaying(false);

      // Create victory particle effect
      createParticleExplosion(object.x, object.y, '#f59e0b');

      // Screen reader announcement
      if (accessibilitySettings.screenReader) {
        accessibilityService.announceToScreenReader(`Target found! Round ${round} completed in ${(timeMs / 1000).toFixed(2)} seconds`);
      }

      // Play sound
      if (accessibilitySettings.soundEnabled) {
        audioService.play('success');
      }

      toast({
        title: "Target Found!",
        description: `Round ${round} completed in ${(timeMs / 1000).toFixed(2)}s`,
      });

      setTimeout(() => {
        onRoundComplete(timeMs);
        setFoundTarget(false);
        setIsPlaying(false);
      }, 1000);
    } else {
      // Wrong object clicked - create negative particle effect
      createParticleExplosion(object.x, object.y, '#ef4444');

      // Screen reader announcement
      if (accessibilitySettings.screenReader) {
        accessibilityService.announceToScreenReader('Wrong object clicked. Keep looking for the Fiverr logo');
      }

      // Play sound
      if (accessibilitySettings.soundEnabled) {
        audioService.play('error');
      }

      toast({
        title: "Wrong Object!",
        description: "That's an avocado, not the Fiverr logo!",
        variant: "destructive"
      });
    }
  }, [isPlaying, foundTarget, startTime, round, onRoundComplete, accessibilitySettings, toast]);

  // Animation loop for moving objects
  useEffect(() => {
    if (!isPlaying || isFrozen) return;

    const { hasMovement, movementSpeed } = getDifficulty();
    if (!hasMovement) return;

    const interval = setInterval(() => {
      setObjects(prevObjects =>
        prevObjects.map(obj => {
          // Skip movement for target (Fiverr logo)
          if (obj.isTarget || !obj.velocityX || !obj.velocityY) return obj;

          let newX = obj.x + obj.velocityX * movementSpeed;
          let newY = obj.y + obj.velocityY * movementSpeed;
          let newVelX = obj.velocityX;
          let newVelY = obj.velocityY;

          // Bounce off edges
          if (newX <= 2 || newX >= 93) {
            newVelX = -newVelX;
            newX = Math.max(2, Math.min(93, newX));
          }
          if (newY <= 2 || newY >= 93) {
            newVelY = -newVelY;
            newY = Math.max(2, Math.min(93, newY));
          }

          return {
            ...obj,
            x: newX,
            y: newY,
            velocityX: newVelX,
            velocityY: newVelY
          };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, isFrozen, getDifficulty]);

  // Particle animation loop
  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles(prev =>
        prev
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 1
          }))
          .filter(particle => particle.life > 0)
      );
    }, 16); // 60fps

    return () => clearInterval(interval);
  }, [particles]);

  // Time-based countdown is handled at a higher level so it always ticks

  // Start first round automatically
  useEffect(() => {
    if (round > 0) {
      startRound();
    }
  }, [round, startRound]);

  return (
    <div className="relative w-full min-h-screen">
      <div
        className="relative w-full bg-game-bg border-4 border-primary pixel-border overflow-hidden"
        ref={pinchRef}
        style={{
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          height: 'calc(100dvh - 6rem)',
          maxHeight: 'calc(100dvh - 6rem)',
          transform: `scale(${zoomScale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.1s ease-out'
        }}
        role="application"
        aria-label="Find the Fiverr Logo game field"
      >
        <div>
          {/* Time-based mode overlay */}
          {timeRemaining !== undefined && (
            <div className="absolute top-4 right-4 z-50 bg-card border-2 border-primary p-2 pixel-border">
              <div className="font-pixel text-sm text-primary">TIME</div>
              <div className="font-pixel text-lg text-accent">
                {Math.ceil(timeRemaining / 1000)}s
              </div>
            </div>
          )}

          {/* Particles */}
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full pointer-events-none"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                transform: 'translate(-50%, -50%)',
                opacity: particle.life / particle.maxLife
              }}
            />
          ))}

          {/* Visual layer - Fiverr logos (behind avocados) */}
          {objects.filter(obj => obj.isTarget).map((obj, index) => (
            <div
              key={`visual-${obj.id}`}
              className="absolute z-10"
              style={{
                left: `${obj.x}%`,
                top: `${obj.y}%`,
                transform: `translate(-50%, -50%) scale(${isZoomed ? 2.5 : 1})`,
                width: `${getDifficulty().targetSize}px`,
                height: `${getDifficulty().targetSize}px`,
                pointerEvents: 'none' // No interaction on visual layer
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={fiverrLogo}
                  alt="Fiverr Logo"
                  className="object-contain"
                  style={{
                    width: `${Math.max(100 - round * 8, 30)}%`,
                    height: `${Math.max(100 - round * 8, 30)}%`
                  }}
                  draggable={false}
                />
              </div>
            </div>
          ))}

          {/* Visual layer - Avocados (in front) */}
          {objects.filter(obj => !obj.isTarget).map(obj => (
            <div
              key={`visual-${obj.id}`}
              className="absolute z-20"
              style={{
                left: `${obj.x}%`,
                top: `${obj.y}%`,
                width: `${obj.size}px`,
                height: `${obj.size}px`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',  // visual layer, no interaction
              }}
            >
              <AdaptedAvocadoIcon
                size={obj.size * 1.5}
                rotation={obj.colorVariation * 360}
              />
            </div>
          ))}

          {/* Interaction layer - All objects (highest z-index) */}
          {objects.map((obj, index) => (
            <div
              key={`interaction-${obj.id}`}
              className="absolute cursor-pointer transition-transform duration-200 z-30"
              style={{
                left: `${obj.x}%`,
                top: `${obj.y}%`,
                transform: `translate(-50%, -50%) scale(${isZoomed && obj.isTarget ? 2.5 : 1})`,
                width: `${obj.isTarget ? getDifficulty().targetSize : obj.size}px`,
                height: `${obj.isTarget ? getDifficulty().targetSize : obj.size}px`,
                touchAction: 'manipulation',
                backgroundColor: 'transparent' // Invisible but clickable
              }}
              onClick={() => handleObjectClick(obj)}
              onTouchStart={(e) => {
                e.preventDefault();
                handleObjectClick(obj);
              }}
              role="button"
              tabIndex={accessibilitySettings.keyboardNavigation ? 0 : -1}
              aria-label={obj.isTarget ? 'Fiverr logo target' : 'Avocado distraction'}
              onKeyDown={(e) => {
                if (accessibilitySettings.keyboardNavigation && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleObjectClick(obj);
                }
              }}
            />
          ))}
        </div>
      </div>
      <div>
        {/* Side Panel Power-ups (Zoom, Freeze & Hint) */}
        <div className="flex justify-center gap-4 mt-4 z-40">
          {sidePanelPowerUps.map((powerUp) => (
            <div
              key={powerUp.id}
              className={`cursor-pointer transition-all duration-200 ${powerUp.collected ? 'opacity-50 scale-90 cursor-not-allowed' : 'hover:scale-110'
                }`}
              onClick={() => !powerUp.collected && handlePowerUpClick(powerUp)}
              onTouchStart={(e) => {
                if (!powerUp.collected) {
                  e.preventDefault();
                  handlePowerUpClick(powerUp);
                }
              }}
            >
              <div className={`w-12 h-12 flex items-center justify-center rounded-xl text-xl shadow-lg transition-all duration-300 ${powerUp.type === 'zoom'
                ? powerUp.collected
                  ? 'bg-gray-400 border-2 border-gray-500'
                  : 'bg-blue-500 border-2 border-blue-600 hover:bg-blue-600'
                : powerUp.type === 'freeze'
                  ? powerUp.collected
                    ? 'bg-gray-400 border-2 border-gray-500'
                    : 'bg-purple-500 border-2 border-purple-600 hover:bg-purple-600'
                  : powerUp.collected
                    ? 'bg-gray-400 border-2 border-gray-500'
                    : 'bg-yellow-500 border-2 border-yellow-600 hover:bg-yellow-600'
                }`}>
                {powerUp.type === 'zoom' && '🔍'}
                {powerUp.type === 'freeze' && '⏰'}
                {powerUp.type === 'hint' && '⚡'}
              </div>
              <div className={`text-xs text-center mt-1 font-medium rounded px-2 py-1 transition-colors duration-300 ${powerUp.collected
                ? 'text-gray-300 bg-gray-700'
                : 'text-white bg-black/70'
                }`}>
                {powerUp.type === 'zoom' ? 'ZOOM' : powerUp.type === 'freeze' ? 'FREEZE' : 'HINT'}
              </div>
            </div>
          ))}
          {/* </div> */}
        </div>
        {/* Mobile touch overlay for better touch response */}
        {isMobile && (
          <div
            className="absolute inset-0 z-40"
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* Round complete overlay */}
        {foundTarget && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card border-4 border-primary p-8 pixel-border">
              <h3 className="font-pixel text-primary text-center text-lg">
                ROUND {round} COMPLETE!
              </h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};