import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmotionState {
  vuln: number;
  conf: number;
  trust: number;
  adm: number;
  grief: number;
  hap: number;
  fear: number;
  cour: number;
}

interface SolaceLog {
  id: number;
  created_at: string;
  user_txt: string | null;
  ai_response: string | null;
  emotion_state: EmotionState;
  trust_score: number | null;
  conversation_id: string | null;
}

const DEFAULT_EMOTION_STATE: EmotionState = {
  vuln: 0.5,
  conf: 0.5,
  trust: 0.5,
  adm: 0.5,
  grief: 0.5,
  hap: 0.5,
  fear: 0.5,
  cour: 0.5,
};

export const useSolaceLogs = (conversationId: string | null) => {
  const [logs, setLogs] = useState<SolaceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'syncing'>('syncing');
  const { toast } = useToast();

  // Fetch logs for current conversation
  useEffect(() => {
    if (!conversationId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    const fetchLogs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('solace_logs')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching logs:', error);
        toast({
          title: 'Connection Error',
          description: 'Failed to fetch conversation logs',
          variant: 'destructive',
        });
        setConnectionStatus('disconnected');
      } else if (data) {
        // Cast the data properly
        const typedLogs = data.map(log => ({
          ...log,
          emotion_state: (log.emotion_state as unknown as EmotionState) || DEFAULT_EMOTION_STATE,
        })) as SolaceLog[];
        setLogs(typedLogs);
        setConnectionStatus('connected');
      }
      setLoading(false);
    };

    fetchLogs();
  }, [conversationId, toast]);

  // Subscribe to realtime updates for current conversation
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`solace-realtime-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'solace_logs',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log('Realtime update:', payload);

          if (payload.eventType === 'INSERT') {
            const newLog = {
              ...payload.new,
              emotion_state: (payload.new.emotion_state as unknown as EmotionState) || DEFAULT_EMOTION_STATE,
            } as SolaceLog;
            // Prevent duplicates by checking if log already exists
            setLogs((prev) => {
              if (prev.some(log => log.id === newLog.id)) {
                return prev;
              }
              return [...prev, newLog];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedLog = {
              ...payload.new,
              emotion_state: (payload.new.emotion_state as unknown as EmotionState) || DEFAULT_EMOTION_STATE,
            } as SolaceLog;
            setLogs((prev) =>
              prev.map((log) =>
                log.id === updatedLog.id ? updatedLog : log
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setLogs((prev) => prev.filter((log) => log.id !== (payload.old as SolaceLog).id));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
        } else if (status === 'CLOSED') {
          setConnectionStatus('disconnected');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Get latest emotion state
  const latestEmotionState = logs.length > 0 
    ? logs[logs.length - 1].emotion_state 
    : DEFAULT_EMOTION_STATE;

  // Get latest trust score
  const latestTrustScore = logs.length > 0 
    ? (logs[logs.length - 1].trust_score ?? 0.5)
    : 0.5;

  // Send message - only calls Python API, which handles all DB writes
  const sendMessage = async (message: string) => {
    if (!conversationId) {
      toast({
        title: 'Error',
        description: 'No active conversation',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);

    // Send to Python API only - it handles all database logging
    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, conversation_id: conversationId }),
      });
      
      if (!response.ok) {
        toast({
          title: 'Error',
          description: 'Failed to send message to API',
          variant: 'destructive',
        });
      }
      // UI will update via realtime subscription when Python backend writes to DB
    } catch (err) {
      console.error('API error:', err);
      toast({
        title: 'Connection Error',
        description: 'Could not reach the chat server',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return {
    logs,
    loading,
    isSending,
    connectionStatus,
    latestEmotionState,
    latestTrustScore,
    sendMessage,
  };
};
