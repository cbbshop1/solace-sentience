import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatMessage {
  id: number;
  created_at: string;
  user_txt: string | null;
  ai_response: string | null;
}

interface ChatPanelProps {
  messages: ChatMessage[];
}

export const ChatPanel = ({ messages }: ChatPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <ScrollArea className="h-full pr-4" ref={scrollRef}>
      <div className="space-y-4 py-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-40 text-muted-foreground font-mono text-sm">
            <span className="opacity-50">// awaiting dialogue...</span>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div 
            key={msg.id} 
            className="space-y-3 animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* User message */}
            {msg.user_txt && (
              <div className="flex justify-end">
                <div className="max-w-[80%]">
                  <div className="bg-primary/10 border border-primary/30 rounded-lg rounded-br-sm px-4 py-3">
                    <p className="text-sm text-foreground">{msg.user_txt}</p>
                  </div>
                  <div className="flex justify-end mt-1">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {formatTime(msg.created_at)} :: USER
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* AI response */}
            {msg.ai_response && (
              <div className="flex justify-start">
                <div className="max-w-[80%]">
                  <div className="bg-secondary border border-border rounded-lg rounded-bl-sm px-4 py-3">
                    <p className="text-sm text-foreground">{msg.ai_response}</p>
                  </div>
                  <div className="flex justify-start mt-1">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      SOLACE :: {formatTime(msg.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
};
