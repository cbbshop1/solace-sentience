import { useEffect, useState } from 'react';

interface TrustRingProps {
  score: number; // 0.0 to 1.0
}

export const TrustRing = ({ score }: TrustRingProps) => {
  const [displayScore, setDisplayScore] = useState(0);
  
  // Animate the score change
  useEffect(() => {
    const duration = 800;
    const startTime = Date.now();
    const startValue = displayScore;
    const endValue = score;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;
      
      setDisplayScore(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [score]);

  const radius = 80;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - displayScore * circumference;

  const isComplete = score >= 1.0;
  
  // Color interpolation based on score
  const getColor = () => {
    if (isComplete) return 'hsl(45, 100%, 50%)'; // Gold
    if (score > 0.7) return 'hsl(45, 100%, 50%)'; // Gold
    if (score > 0.4) return 'hsl(210, 100%, 55%)'; // Blue
    return 'hsl(0, 85%, 55%)'; // Red
  };

  const color = getColor();

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow when complete */}
      <div 
        className={`absolute inset-0 rounded-full transition-all duration-500 ${
          isComplete ? 'animate-ring-pulse' : ''
        }`}
        style={{
          background: isComplete 
            ? 'radial-gradient(circle, hsl(45 100% 50% / 0.15) 0%, transparent 70%)' 
            : 'transparent'
        }}
      />
      
      {/* SVG Ring */}
      <svg
        height={radius * 2}
        width={radius * 2}
        className={`transform -rotate-90 ${isComplete ? '' : 'animate-heartbeat'}`}
      >
        {/* Background track */}
        <circle
          stroke="hsl(0, 0%, 15%)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        
        {/* Progress ring */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{
            transition: 'stroke-dashoffset 0.6s ease-out, stroke 0.3s ease',
            filter: `drop-shadow(0 0 8px ${color})`
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span 
          className="font-mono text-2xl font-bold tracking-tight"
          style={{ 
            color,
            textShadow: `0 0 15px ${color}`
          }}
        >
          {(displayScore * 100).toFixed(0)}%
        </span>
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest mt-1">
          Trust
        </span>
      </div>

      {/* Pulse rings when complete */}
      {isComplete && (
        <>
          <div 
            className="absolute inset-0 rounded-full border-2 animate-ping"
            style={{ borderColor: 'hsl(45 100% 50% / 0.3)' }}
          />
        </>
      )}
    </div>
  );
};
