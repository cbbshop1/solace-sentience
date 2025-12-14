import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const MessageInput = ({ onSend, disabled }: MessageInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="cyber-card p-2 flex gap-2 items-center">
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter dialogue..."
            disabled={disabled}
            className="bg-background border-none font-sans text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/50 pr-4"
          />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none" />
        </div>
        
        <Button 
          type="submit" 
          size="icon"
          disabled={!message.trim() || disabled}
          className="bg-primary hover:bg-primary/80 text-primary-foreground shrink-0 transition-all duration-200 disabled:opacity-30"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Status indicator */}
      <div className="flex items-center gap-2 mt-2 px-2">
        <div 
          className={`w-1.5 h-1.5 rounded-full ${
            disabled ? 'bg-destructive' : 'bg-joy'
          } animate-pulse`} 
        />
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
          {disabled ? 'Processing...' : 'Ready'}
        </span>
      </div>
    </form>
  );
};
