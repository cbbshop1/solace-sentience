import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SolaceLog {
  id: number;
  created_at: string;
  user_txt: string | null;
  ai_response: string | null;
  emotion_state: {
    vuln: number;
    conf: number;
    trust: number;
    adm: number;
    grief: number;
    hap: number;
    fear: number;
    cour: number;
  };
  trust_score: number | null;
}

export const useSolaceLogs = () => {
  const [logs, setLogs] = useState<SolaceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'syncing'>('syncing');
  const { toast } = useToast();

  // Fetch initial logs
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('solace_logs')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching logs:', error);
        toast({
          title: 'Connection Error',
          description: 'Failed to fetch conversation logs',
          variant: 'destructive',
        });
        setConnectionStatus('disconnected');
      } else {
        setLogs((data || []) as SolaceLog[]);
        setConnectionStatus('connected');
      }
      setLoading(false);
    };

    fetchLogs();
  }, [toast]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('solace-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'solace_logs',
        },
        (payload) => {
          console.log('Realtime update:', payload);

          if (payload.eventType === 'INSERT') {
            setLogs((prev) => [...prev, payload.new as SolaceLog]);
          } else if (payload.eventType === 'UPDATE') {
            setLogs((prev) =>
              prev.map((log) =>
                log.id === (payload.new as SolaceLog).id ? (payload.new as SolaceLog) : log
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
  }, []);

  // Get latest emotion state
  const latestEmotionState = logs.length > 0 
    ? logs[logs.length - 1].emotion_state 
    : {
        vuln: 0.5,
        conf: 0.5,
        trust: 0.5,
        adm: 0.5,
        grief: 0.5,
        hap: 0.5,
        fear: 0.5,
        cour: 0.5,
      };

  // Get latest trust score
  const latestTrustScore = logs.length > 0 
    ? (logs[logs.length - 1].trust_score ?? 0.5)
    : 0.5;

  // Send message
  const sendMessage = async (message: string) => {
    // Option 1: Save directly to DB
    const { error: dbError } = await supabase.from('solace_logs').insert({
      user_txt: message,
      ai_response: null,
      emotion_state: latestEmotionState,
      trust_score: latestTrustScore,
    });

    if (dbError) {
      console.error('DB error:', dbError);
    }

    // Option 2: Also try the local API
    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) {
        console.log('Local API not available, message saved to DB only');
      }
    } catch (err) {
      // Local API not available, that's okay
      console.log('Local API not reachable, message saved to DB');
    }
  };

  return {
    logs,
    loading,
    connectionStatus,
    latestEmotionState,
    latestTrustScore,
    sendMessage,
  };
};
