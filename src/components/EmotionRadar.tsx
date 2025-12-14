import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

interface EmotionState {
  grief: number;
  trust: number;
  fear: number;
  joy: number;
  surprise: number;
  sadness: number;
  anger: number;
  anticipation: number;
}

interface EmotionRadarProps {
  emotionState: EmotionState;
}

const emotionColors: Record<string, string> = {
  grief: 'hsl(210, 100%, 55%)',
  trust: 'hsl(45, 100%, 50%)',
  fear: 'hsl(0, 85%, 55%)',
  joy: 'hsl(145, 70%, 50%)',
  surprise: 'hsl(280, 80%, 60%)',
  sadness: 'hsl(220, 60%, 45%)',
  anger: 'hsl(15, 90%, 55%)',
  anticipation: 'hsl(35, 95%, 55%)',
};

// Get dominant emotion for color theming
const getDominantEmotion = (state: EmotionState): string => {
  let max = 0;
  let dominant = 'trust';
  for (const [emotion, value] of Object.entries(state)) {
    if (value > max) {
      max = value;
      dominant = emotion;
    }
  }
  return dominant;
};

export const EmotionRadar = ({ emotionState }: EmotionRadarProps) => {
  const data = Object.entries(emotionState).map(([emotion, value]) => ({
    emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
    value: value,
    fullMark: 1,
  }));

  const dominantEmotion = getDominantEmotion(emotionState);
  const accentColor = emotionColors[dominantEmotion];

  return (
    <div className="w-full h-80 relative">
      {/* Scanline overlay */}
      <div className="absolute inset-0 scanline pointer-events-none z-10 opacity-50" />
      
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid 
            stroke="hsl(0, 0%, 25%)" 
            strokeWidth={0.5}
            gridType="polygon"
          />
          <PolarAngleAxis 
            dataKey="emotion" 
            tick={{ 
              fill: 'hsl(0, 0%, 60%)', 
              fontSize: 11,
              fontFamily: 'JetBrains Mono, monospace'
            }}
            tickLine={false}
          />
          <Radar
            name="Emotion"
            dataKey="value"
            stroke={accentColor}
            fill={accentColor}
            fillOpacity={0.25}
            strokeWidth={2}
            animationDuration={600}
            animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Label */}
      <div className="absolute bottom-2 left-2">
        <span className="font-mono text-xs text-muted-foreground tracking-wider uppercase">
          Emotion Manifold
        </span>
      </div>
    </div>
  );
};
