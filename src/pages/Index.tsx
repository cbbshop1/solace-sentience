import { SolaceHeader } from '@/components/SolaceHeader';
import { EmotionRadar } from '@/components/EmotionRadar';
import { TrustRing } from '@/components/TrustRing';
import { ChatPanel } from '@/components/ChatPanel';
import { MessageInput } from '@/components/MessageInput';
import { useSolaceLogs } from '@/hooks/useSolaceLogs';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const {
    logs,
    loading,
    connectionStatus,
    latestEmotionState,
    latestTrustScore,
    sendMessage,
  } = useSolaceLogs();

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Header */}
      <SolaceHeader connectionStatus={connectionStatus} />

      {/* Main content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* Left Panel - The Manifold */}
        <div className="w-full lg:w-[400px] border-r border-border p-6 flex flex-col gap-8">
          {/* Section label */}
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              The Manifold
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-primary/50 to-transparent" />
          </div>

          {/* Radar Chart */}
          <div className="cyber-card p-4">
            <EmotionRadar emotionState={latestEmotionState} />
          </div>

          {/* Trust Ring */}
          <div className="cyber-card p-8 flex flex-col items-center">
            <TrustRing score={latestTrustScore} />
            <div className="mt-6 text-center">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                Trust Trace
              </span>
            </div>
          </div>

          {/* Metrics ticker */}
          <div className="cyber-card p-4 font-mono text-xs">
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <div className="flex justify-between">
                <span>Sessions</span>
                <span className="text-foreground">{logs.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Coherence</span>
                <span className="text-foreground">{(latestTrustScore * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - The Dialogue */}
        <div className="flex-1 flex flex-col">
          {/* Section label */}
          <div className="p-6 pb-0">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/50" />
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                The Dialogue
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-accent/50" />
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 px-6 overflow-hidden">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
            ) : (
              <ChatPanel messages={logs} />
            )}
          </div>

          {/* Input area */}
          <div className="p-6 pt-2">
            <MessageInput onSend={sendMessage} disabled={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
