import { useState, useRef } from 'react';
import { Send, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  onSend: (message: string) => void;
  onCancel?: () => void;
  disabled?: boolean;
  isSending?: boolean;
}

export const MessageInput = ({ onSend, onCancel, disabled, isSending }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !isSending) {
      onSend(message.trim());
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };

  const handleButtonClick = () => {
    if (isSending && onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="cyber-card p-2 flex gap-2 items-end">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Enter dialogue..."
            disabled={disabled || isSending}
            rows={1}
            className="bg-background border-none font-sans text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/50 pr-4 min-h-[40px] max-h-[150px] resize-none"
          />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none" />
        </div>
        
        {isSending ? (
          <Button 
            type="button"
            size="icon"
            onClick={handleButtonClick}
            className="bg-destructive hover:bg-destructive/80 text-destructive-foreground shrink-0 transition-all duration-200"
            title="Stop generating"
          >
            <Square className="h-4 w-4 fill-current" />
          </Button>
        ) : (
          <Button 
            type="submit" 
            size="icon"
            disabled={!message.trim() || disabled}
            className="bg-primary hover:bg-primary/80 text-primary-foreground shrink-0 transition-all duration-200 disabled:opacity-30"
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Status indicator */}
      <div className="flex items-center gap-2 mt-2 px-2">
        <div 
          className={`w-1.5 h-1.5 rounded-full ${
            isSending ? 'bg-accent' : disabled ? 'bg-destructive' : 'bg-joy'
          } animate-pulse`} 
        />
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
          {isSending ? 'Thinking... (click stop to cancel)' : disabled ? 'Processing...' : 'Ready'}
        </span>
      </div>
    </form>
  );
};
