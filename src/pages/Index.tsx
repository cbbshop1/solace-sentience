import { useRef, useCallback, useState } from 'react';
import { SolaceHeader } from '@/components/SolaceHeader';
import { EmotionRadar } from '@/components/EmotionRadar';
import { EmotionScores } from '@/components/EmotionScores';
import { EmotionTrends } from '@/components/EmotionTrends';
import { ChatPanel } from '@/components/ChatPanel';
import { MessageInput } from '@/components/MessageInput';
import { ConversationSidebar } from '@/components/ConversationSidebar';
import { ExportButton } from '@/components/ExportButton';
import { useSolaceLogs } from '@/hooks/useSolaceLogs';
import { useConversations } from '@/hooks/useConversations';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { downloadMarkdown } from '@/utils/exportConversation';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const Index = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    loading: conversationsLoading,
    createConversation,
    archiveConversation,
    updateConversationTitle,
  } = useConversations();

  const {
    logs,
    loading: logsLoading,
    isSending,
    connectionStatus,
    latestEmotionState,
    latestTrustScore,
    sendMessage,
  } = useSolaceLogs(activeConversationId);

  const loading = conversationsLoading || logsLoading;

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const handleExport = useCallback(() => {
    if (!activeConversation || logs.length === 0) return;
    downloadMarkdown(activeConversation.title || 'Untitled', logs, true);
  }, [activeConversation, logs]);

  const handleFocusSearch = useCallback(() => {
    if (!sidebarCollapsed) {
      searchInputRef.current?.focus();
    }
  }, [sidebarCollapsed]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  useKeyboardShortcuts({
    onNewThread: createConversation,
    onExport: handleExport,
    onSearch: handleFocusSearch,
    onToggleSidebar: handleToggleSidebar,
  });

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Header */}
      <SolaceHeader connectionStatus={connectionStatus} />

      {/* Main content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Collapsible Thread Sidebar */}
        <div 
          className={`border-r border-border bg-card/30 transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'w-12' : 'w-[200px]'
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Toggle Button */}
            <button
              onClick={handleToggleSidebar}
              className="flex items-center justify-center h-10 border-b border-border hover:bg-primary/10 transition-colors group"
              title={sidebarCollapsed ? 'Expand sidebar (⌘B)' : 'Collapse sidebar (⌘B)'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </button>

            {/* Sidebar Content */}
            {!sidebarCollapsed && (
              <ConversationSidebar
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelect={setActiveConversationId}
                onNewThread={() => createConversation()}
                onArchive={archiveConversation}
                onRename={updateConversationTitle}
                searchInputRef={searchInputRef}
              />
            )}
          </div>
        </div>

        {/* Resizable Panels Container */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Left Panel - The Manifold */}
          <ResizablePanel defaultSize={35} minSize={20} maxSize={50}>
            <div className="h-full p-6 flex flex-col gap-6 overflow-y-auto">
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

              {/* Emotion Scores */}
              <div className="cyber-card p-4">
                <EmotionScores emotionState={latestEmotionState} />
              </div>

              {/* Emotion Trends */}
              <div className="cyber-card p-4">
                <EmotionTrends logs={logs} />
              </div>

              {/* Metrics ticker */}
              <div className="cyber-card p-4 font-mono text-xs">
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Messages</span>
                    <span className="text-foreground">{logs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coherence</span>
                    <span className="text-foreground">{(latestTrustScore * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </ResizablePanel>

          {/* Resize Handle */}
          <ResizableHandle 
            withHandle 
            className="bg-border/50 hover:bg-primary/30 transition-colors data-[resize-handle-active]:bg-primary/50"
          />

          {/* Right Panel - The Dialogue */}
          <ResizablePanel defaultSize={65} minSize={40}>
            <div className="h-full flex flex-col">
              {/* Section label with export button */}
              <div className="p-6 pb-0">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/50" />
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                    The Dialogue
                  </span>
                  <ExportButton 
                    onClick={handleExport} 
                    disabled={!activeConversation || logs.length === 0} 
                  />
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-accent/50" />
                </div>
              </div>

              {/* Chat area */}
              <div className="flex-1 px-6 overflow-hidden w-full">
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
                <MessageInput 
                  onSend={sendMessage} 
                  disabled={loading || !activeConversationId} 
                  isSending={isSending}
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Index;
