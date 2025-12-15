-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  title TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (matching solace_logs pattern)
CREATE POLICY "Allow public read access" 
ON public.conversations 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access" 
ON public.conversations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access" 
ON public.conversations 
FOR UPDATE 
USING (true);

-- Add conversation_id to solace_logs
ALTER TABLE public.solace_logs 
ADD COLUMN conversation_id UUID REFERENCES public.conversations(id);

-- Create a default conversation for existing logs
INSERT INTO public.conversations (id, title, created_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'Initial Session', now());

-- Backfill existing logs to default conversation
UPDATE public.solace_logs 
SET conversation_id = '00000000-0000-0000-0000-000000000001'
WHERE conversation_id IS NULL;

-- Enable realtime for conversations
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;