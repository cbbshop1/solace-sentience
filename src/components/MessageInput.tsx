import { useState, useRef } from 'react';
import { Send, Square, Paperclip, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface MessageInputProps {
  onSend: (message: string) => void;
  onCancel?: () => void;
  disabled?: boolean;
  isSending?: boolean;
}

export const MessageInput = ({ onSend, onCancel, disabled, isSending }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      const fileContent = data.content;
      
      // Append file content to current message
      const attachment = `[ATTACHED FILE: ${file.name}]\n${fileContent}\n[END ATTACHMENT]\n`;
      setMessage(prev => prev + attachment);
      
      // Auto-resize textarea after content is appended
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
      }, 0);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.md"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="cyber-card p-2 flex gap-2 items-end">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={handleFileClick}
          disabled={isUploading || disabled}
          className="shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted/50"
          title="Upload file"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
        </Button>
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
