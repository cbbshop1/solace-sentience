import { useState, useRef, useEffect } from 'react';
import { Plus, Archive, MessageSquare, Pencil, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/hooks/useConversations';

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onNewThread: () => void;
  onArchive: (id: string) => void;
  onRename: (id: string, title: string) => void;
  searchInputRef?: React.RefObject<HTMLInputElement>;
}

export const ConversationSidebar = ({
  conversations,
  activeConversationId,
  onSelect,
  onNewThread,
  onArchive,
  onRename,
  searchInputRef,
}: ConversationSidebarProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleStartEdit = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditValue(conv.title || '');
  };

  const handleSaveEdit = () => {
    if (editingId && editValue.trim()) {
      onRename(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditValue('');
    }
  };

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const filteredConversations = conversations.filter((conv) =>
    (conv.title || 'Untitled').toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Search Input */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search threads..."
            className="h-8 pl-7 pr-7 font-mono text-xs bg-background"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Thread List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground font-mono text-xs">
              {searchQuery ? 'No matches found' : 'No threads yet'}
            </div>
          ) : (
            filteredConversations.map((conv) => (
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
                  {editingId === conv.id ? (
                    <Input
                      ref={editInputRef}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={handleKeyDown}
                      onClick={(e) => e.stopPropagation()}
                      className="h-6 px-1 py-0 font-mono text-xs"
                    />
                  ) : (
                    <>
                      <p className="font-mono text-xs truncate">
                        {conv.title || 'Untitled'}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {formatDate(conv.created_at)}
                      </p>
                    </>
                  )}
                </div>
                {editingId !== conv.id && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => handleStartEdit(conv, e)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        onArchive(conv.id);
                      }}
                    >
                      <Archive className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Keyboard shortcuts hint */}
      <div className="p-2 border-t border-border">
        <div className="font-mono text-[10px] text-muted-foreground text-center space-y-0.5">
          <div>⌘N New • ⌘E Export</div>
          <div>⌘K Search</div>
        </div>
      </div>
    </div>
  );
};
