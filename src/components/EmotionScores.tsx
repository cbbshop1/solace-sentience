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

interface EmotionScoresProps {
  emotionState: EmotionState;
}

const emotionLabels: Record<keyof EmotionState, string> = {
  vuln: 'Vulnerability',
  conf: 'Confusion',
  trust: 'Trust',
  adm: 'Admiration',
  grief: 'Grief',
  hap: 'Happiness',
  fear: 'Fear',
  cour: 'Courage',
};

const emotionColors: Record<keyof EmotionState, string> = {
  vuln: 'hsl(280, 70%, 60%)',
  conf: 'hsl(45, 100%, 50%)',
  trust: 'hsl(45, 100%, 50%)',
  adm: 'hsl(160, 70%, 50%)',
  grief: 'hsl(210, 100%, 55%)',
  hap: 'hsl(120, 60%, 50%)',
  fear: 'hsl(0, 85%, 55%)',
  cour: 'hsl(30, 100%, 50%)',
};

export const EmotionScores = ({ emotionState }: EmotionScoresProps) => {
  const emotions = Object.keys(emotionLabels) as (keyof EmotionState)[];

  return (
    <div className="space-y-2">
      <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4 text-center">
        Emotion Scores
      </div>
      <div className="space-y-1.5">
        {emotions.map((key) => {
          const value = emotionState[key] ?? 0;
          const color = emotionColors[key];
          
          return (
            <div key={key} className="flex items-center justify-between font-mono text-sm">
              <span className="text-muted-foreground">{emotionLabels[key]}</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-16 h-1.5 rounded-full bg-muted overflow-hidden"
                >
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(value * 100, 100)}%`,
                      backgroundColor: color,
                      boxShadow: `0 0 6px ${color}`
                    }}
                  />
                </div>
                <span 
                  className="w-14 text-right tabular-nums"
                  style={{ color }}
                >
                  {value.toFixed(3)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
