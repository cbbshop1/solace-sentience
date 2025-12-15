import { Plus, Archive, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/hooks/useConversations';

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onNewThread: () => void;
  onArchive: (id: string) => void;
}

export const ConversationSidebar = ({
  conversations,
  activeConversationId,
  onSelect,
  onNewThread,
  onArchive,
}: ConversationSidebarProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* New Thread Button */}
      <div className="p-3 border-b border-border">
        <Button
          onClick={onNewThread}
          variant="outline"
          className="w-full justify-start gap-2 font-mono text-xs"
        >
          <Plus className="h-4 w-4" />
          New Thread
        </Button>
      </div>

      {/* Thread List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground font-mono text-xs">
              No threads yet
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  'group flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors',
                  activeConversationId === conv.id
                    ? 'bg-primary/10 border border-primary/30'
                    : 'hover:bg-secondary border border-transparent'
                )}
                onClick={() => onSelect(conv.id)}
              >
                <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs truncate">
                    {conv.title || 'Untitled'}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {formatDate(conv.created_at)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(conv.id);
                  }}
                >
                  <Archive className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
