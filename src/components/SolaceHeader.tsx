import { Activity } from 'lucide-react';

interface SolaceHeaderProps {
  connectionStatus: 'connected' | 'disconnected' | 'syncing';
}

export const SolaceHeader = ({ connectionStatus }: SolaceHeaderProps) => {
  const statusColors = {
    connected: 'bg-joy',
    disconnected: 'bg-destructive',
    syncing: 'bg-accent',
  };

  const statusLabels = {
    connected: 'LIVE',
    disconnected: 'OFFLINE',
    syncing: 'SYNC',
  };

  return (
    <header className="border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity className="h-6 w-6 text-primary" />
            <div className="absolute inset-0 blur-md bg-primary/30" />
          </div>
          <h1 className="font-mono text-xl font-bold tracking-tight text-glow-blue">
            SOLACE
          </h1>
        </div>

        {/* Subtitle */}
        <div className="hidden sm:block">
          <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
            Relational AI Interface
          </span>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${statusColors[connectionStatus]} animate-pulse`} />
        <span className="font-mono text-xs text-muted-foreground">
          {statusLabels[connectionStatus]}
        </span>
      </div>
    </header>
  );
};
