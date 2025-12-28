import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ReasoningAccordion } from './ReasoningAccordion';
import type { PendingMessage } from '@/hooks/useSolaceLogs';

interface ChatMessage {
  id: number;
  created_at: string;
  user_txt: string | null;
  ai_response: string | null;
  reasoning: string | null;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  pendingMessage?: PendingMessage | null;
  isPolling?: boolean;
}

const ThinkingIndicator = () => (
  <div className="flex justify-start min-w-0 animate-fade-in">
    <div className="max-w-[80%] min-w-0">
      <div className="bg-secondary border border-border rounded-lg rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span 
              className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" 
              style={{ animationDelay: '0ms' }} 
            />
            <span 
              className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" 
              style={{ animationDelay: '150ms' }} 
            />
            <span 
              className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" 
              style={{ animationDelay: '300ms' }} 
            />
          </div>
          <span className="text-xs text-muted-foreground font-mono">processing...</span>
        </div>
      </div>
      <div className="flex justify-start mt-1">
        <span className="font-mono text-[10px] text-muted-foreground">
          SOLACE :: thinking...
        </span>
      </div>
    </div>
  </div>
);

export const ChatPanel = ({ messages, pendingMessage, isPolling }: ChatPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages or pending message
  useEffect(() => {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages.length, pendingMessage, isPolling]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <ScrollArea className="h-full w-full pr-4" ref={scrollRef}>
      <div className="space-y-4 py-4 w-full">
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
              <div className="flex justify-end min-w-0">
                <div className="max-w-[80%] min-w-0">
                  <div className="bg-primary/10 border border-primary/30 rounded-lg rounded-br-sm px-4 py-3">
                    <div className="text-sm text-foreground prose prose-invert prose-sm break-words [overflow-wrap:anywhere] prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-code:bg-primary/20 prose-code:px-1 prose-code:rounded prose-pre:bg-background/50 prose-pre:border prose-pre:border-border prose-pre:overflow-x-auto">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.user_txt}
                      </ReactMarkdown>
                    </div>
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
              <div className="flex justify-start min-w-0">
                <div className="max-w-[80%] min-w-0">
                  {/* Reasoning accordion above message */}
                  <ReasoningAccordion reasoning={msg.reasoning} />
                  
                  <div className="bg-secondary border border-border rounded-lg rounded-bl-sm px-4 py-3">
                    <div className="text-sm text-foreground prose prose-invert prose-sm break-words [overflow-wrap:anywhere] prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-code:bg-accent/20 prose-code:px-1 prose-code:rounded prose-pre:bg-background/50 prose-pre:border prose-pre:border-border prose-pre:overflow-x-auto">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.ai_response}
                      </ReactMarkdown>
                    </div>
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

        {/* Pending user message (optimistic) */}
        {pendingMessage && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex justify-end min-w-0">
              <div className="max-w-[80%] min-w-0">
                <div className="bg-primary/10 border border-primary/30 rounded-lg rounded-br-sm px-4 py-3">
                  <div className="text-sm text-foreground">
                    {pendingMessage.user_txt}
                  </div>
                </div>
                <div className="flex justify-end mt-1">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {formatTime(pendingMessage.created_at)} :: USER
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Thinking indicator */}
        {isPolling && <ThinkingIndicator />}
        
        <div ref={bottomRef} />
      </div>
      
    </ScrollArea>
  );
};
