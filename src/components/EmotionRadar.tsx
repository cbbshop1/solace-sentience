import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

interface EmotionState {
  vuln: number;
  conf: number;
  trust: number;
  adm: number;
  grief: number;
  hap: number;
  fear: number;
  cour: number;
}

interface EmotionRadarProps {
  emotionState: EmotionState;
}

const emotionLabels: Record<string, string> = {
  vuln: 'Vulnerability',
  conf: 'Confusion',
  trust: 'Trust',
  adm: 'Admiration',
  grief: 'Grief',
  hap: 'Happiness',
  fear: 'Fear',
  cour: 'Courage',
};

const emotionColors: Record<string, string> = {
  vuln: 'hsl(280, 80%, 60%)',
  conf: 'hsl(220, 60%, 45%)',
  trust: 'hsl(45, 100%, 50%)',
  adm: 'hsl(35, 95%, 55%)',
  grief: 'hsl(210, 100%, 55%)',
  hap: 'hsl(145, 70%, 50%)',
  fear: 'hsl(0, 85%, 55%)',
  cour: 'hsl(15, 90%, 55%)',
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
  const data = Object.entries(emotionState).map(([key, value]) => ({
    emotion: emotionLabels[key] || key,
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