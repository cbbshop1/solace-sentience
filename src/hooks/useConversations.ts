import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Conversation {
  id: string;
  created_at: string;
  title: string | null;
  is_archived: boolean;
}

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch conversations',
          variant: 'destructive',
        });
      } else {
        setConversations(data || []);
        // Set first conversation as active if none selected
        if (data && data.length > 0 && !activeConversationId) {
          setActiveConversationId(data[0].id);
        }
      }
      setLoading(false);
    };

    fetchConversations();
  }, [toast]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('conversations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newConv = payload.new as Conversation;
            if (!newConv.is_archived) {
              setConversations((prev) => [newConv, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Conversation;
            if (updated.is_archived) {
              setConversations((prev) => prev.filter((c) => c.id !== updated.id));
            } else {
              setConversations((prev) =>
                prev.map((c) => (c.id === updated.id ? updated : c))
              );
            }
          } else if (payload.eventType === 'DELETE') {
            setConversations((prev) =>
              prev.filter((c) => c.id !== (payload.old as Conversation).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createConversation = async (title?: string) => {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        title: title || `Session ${new Date().toLocaleDateString()}`,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new thread',
        variant: 'destructive',
      });
      return null;
    }

    setActiveConversationId(data.id);
    return data;
  };

  const archiveConversation = async (id: string) => {
    const { error } = await supabase
      .from('conversations')
      .update({ is_archived: true })
      .eq('id', id);

    if (error) {
      console.error('Error archiving conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive thread',
        variant: 'destructive',
      });
      return false;
    }

    // Switch to another conversation if archiving active one
    if (id === activeConversationId) {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      } else {
        // Create a new one if none left
        await createConversation();
      }
    }

    return true;
  };

  const updateConversationTitle = async (id: string, title: string) => {
    const { error } = await supabase
      .from('conversations')
      .update({ title })
      .eq('id', id);

    if (error) {
      console.error('Error updating conversation title:', error);
      return false;
    }
    return true;
  };

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    loading,
    createConversation,
    archiveConversation,
    updateConversationTitle,
  };
};
