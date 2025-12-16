import { LineChart, Line, ResponsiveContainer } from 'recharts';

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

interface SolaceLog {
  id: number;
  emotion_state: EmotionState;
}

interface EmotionTrendsProps {
  logs: SolaceLog[];
}

const emotionConfig: Record<keyof EmotionState, { label: string; color: string }> = {
  vuln: { label: 'Vulnerability', color: 'hsl(280, 70%, 60%)' },
  conf: { label: 'Confusion', color: 'hsl(45, 100%, 50%)' },
  trust: { label: 'Trust', color: 'hsl(45, 100%, 50%)' },
  adm: { label: 'Admiration', color: 'hsl(160, 70%, 50%)' },
  grief: { label: 'Grief', color: 'hsl(210, 100%, 55%)' },
  hap: { label: 'Happiness', color: 'hsl(120, 60%, 50%)' },
  fear: { label: 'Fear', color: 'hsl(0, 85%, 55%)' },
  cour: { label: 'Courage', color: 'hsl(30, 100%, 50%)' },
};

export const EmotionTrends = ({ logs }: EmotionTrendsProps) => {
  // Get the last 15 data points
  const recentLogs = logs.slice(-15);
  
  if (recentLogs.length < 2) {
    return (
      <div className="text-center py-4 text-muted-foreground font-mono text-xs">
        Need more data for trends
      </div>
    );
  }

  const emotions = Object.keys(emotionConfig) as (keyof EmotionState)[];

  return (
    <div className="space-y-2">
      <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4 text-center">
        Emotion Trends
      </div>
      <div className="grid grid-cols-2 gap-2">
        {emotions.map((emotion) => {
          const data = recentLogs.map((log, i) => ({
            index: i,
            value: log.emotion_state[emotion] ?? 0.5,
          }));
          const config = emotionConfig[emotion];

          return (
            <div key={emotion} className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground w-12 truncate">
                {config.label.slice(0, 4)}
              </span>
              <div className="flex-1 h-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={config.color}
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
