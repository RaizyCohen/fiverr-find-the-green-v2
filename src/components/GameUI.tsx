import React from 'react';
import { useMobile } from '@/hooks/use-mobile';


interface GameUIProps {
  round: number;
  score: number;
  totalTime: number;
  combo: number;
  isPlaying: boolean;
}

function getDistance(t1: Touch, t2: Touch) {
  const dx = t1.clientX - t2.clientX;
  const dy = t1.clientY - t2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

export const GameUI: React.FC<GameUIProps> = ({ round, score, totalTime, combo, isPlaying }) => {
  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(2);
  };

  const { isMobile, isSmallScreen } = useMobile();

  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom scale
  const [scale, setScale] = useState(1);
  // Pan position
  const [pos, setPos] = useState({ x: 0, y: 0 });

  // For pinch zoom + pan tracking
  const lastDistance = useRef<number | null>(null);
  const lastMidpoint = useRef<{ x: number; y: number } | null>(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const isPanning = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        isPanning.current = true;
        const d = getDistance(e.touches[0], e.touches[1]);
        lastDistance.current = d;

        lastMidpoint.current = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        };
        lastPos.current = pos;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && isPanning.current && lastDistance.current && lastMidpoint.current) {
        e.preventDefault(); // prevent page scroll

        const newDist = getDistance(e.touches[0], e.touches[1]);
        const scaleChange = newDist / lastDistance.current;
        let newScale = scale * scaleChange;
        newScale = Math.min(Math.max(1, newScale), 3); // clamp zoom

        // Calculate midpoint movement for panning
        const newMidpoint = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        };

        // Pan delta in screen coordinates
        const deltaX = newMidpoint.x - lastMidpoint.current.x;
        const deltaY = newMidpoint.y - lastMidpoint.current.y;

        // Update pan relative to last position + delta adjusted for scale
        setPos({
          x: lastPos.current.x + deltaX,
          y: lastPos.current.y + deltaY,
        });

        setScale(newScale);

        // Update refs for next event
        lastDistance.current = newDist;
        lastMidpoint.current = newMidpoint;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        isPanning.current = false;
        lastDistance.current = null;
        lastMidpoint.current = null;
        lastPos.current = pos; // keep last pos for next pan
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pos, scale]);

  return (
    <div
      ref={containerRef}
      className="w-full bg-card border-4 border-primary p-4 pixel-border"
      style={{
        touchAction: 'none',
        transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      <div className="grid grid-cols-4 gap-4 text-center">
        <div>
          <div className={`font-pixel text-muted-foreground mb-1 ${isMobile ? 'text-xs' : 'text-sm'
            }`}>ROUND</div>
          <div
            className={`font-pixel text-primary ${isMobile ? 'text-lg' : 'text-2xl'
              }`}
          >{round}/20</div>
        </div>

        <div>
          <div className={`font-pixel text-muted-foreground mb-1 ${isMobile ? 'text-xs' : 'text-sm'
            }`}>SCORE</div>
          <div
            className={`font-pixel ${isMobile ? 'text-lg' : 'text-2xl'
              } text-black-500`}
          >{score.toLocaleString()}</div>
        </div>

        <div>
          <div className={`font-pixel text-muted-foreground mb-1 ${isMobile ? 'text-xs' : 'text-sm'
            }`}>TIME</div>
          <div className={`font-pixel ${isMobile ? 'text-sm' : 'text-2xl'
            } text-black-500`}
          >{formatTime(totalTime)}s</div>
        </div>

        <div>
          <div className={`font-pixel text-muted-foreground mb-1 ${isMobile ? 'text-xs' : 'text-sm'
            }`}>COMBO</div>
          <div className={`font-pixel ${isMobile ? 'text-lg' : 'text-2xl'
            } text-orange-500`}
          >{combo}x</div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <div className="font-pixel text-xs text-muted-foreground">
          Click on the Fiverr logo among the avocados!
        </div>
      </div>
    </div>
  );
};