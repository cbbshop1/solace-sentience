-- Create solace_logs table for conversation history and emotion tracking
CREATE TABLE public.solace_logs (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_txt TEXT,
  ai_response TEXT,
  emotion_state JSONB DEFAULT '{"grief": 0.5, "trust": 0.5, "fear": 0.5, "joy": 0.5, "surprise": 0.5, "sadness": 0.5, "anger": 0.5, "anticipation": 0.5}'::jsonb,
  trust_score FLOAT DEFAULT 0.5
);

-- Enable Row Level Security
ALTER TABLE public.solace_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (since external Python agent also reads/writes)
CREATE POLICY "Allow public read access" 
ON public.solace_logs 
FOR SELECT 
USING (true);

-- Create policy for public insert access
CREATE POLICY "Allow public insert access" 
ON public.solace_logs 
FOR INSERT 
WITH CHECK (true);

-- Create policy for public update access
CREATE POLICY "Allow public update access" 
ON public.solace_logs 
FOR UPDATE 
USING (true);

-- Enable realtime for solace_logs table
ALTER PUBLICATION supabase_realtime ADD TABLE public.solace_logs;