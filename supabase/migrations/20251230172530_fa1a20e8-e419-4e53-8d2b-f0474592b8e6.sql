-- Create doctrine table for semantic knowledge storage
CREATE TABLE public.doctrine (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  embedding vector(768),
  source text,
  title text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create HNSW index for fast similarity search
CREATE INDEX doctrine_embedding_idx ON public.doctrine 
USING hnsw (embedding vector_cosine_ops);

-- Enable RLS
ALTER TABLE public.doctrine ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.doctrine
  FOR SELECT USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert access" ON public.doctrine
  FOR INSERT WITH CHECK (true);

-- Allow public update access
CREATE POLICY "Allow public update access" ON public.doctrine
  FOR UPDATE USING (true);

-- Allow public delete access
CREATE POLICY "Allow public delete access" ON public.doctrine
  FOR DELETE USING (true);

-- Drop the existing match_doctrine function that searches solace_logs
DROP FUNCTION IF EXISTS public.match_doctrine(vector, double precision, integer);

-- Create new match_doctrine function for the doctrine table
CREATE OR REPLACE FUNCTION public.match_doctrine(
  query_embedding vector,
  match_threshold double precision,
  match_count integer
)
RETURNS TABLE(
  id uuid,
  content text,
  source text,
  title text,
  similarity double precision
)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
begin
  return query
  select
    doctrine.id,
    doctrine.content,
    doctrine.source,
    doctrine.title,
    1 - (doctrine.embedding <=> query_embedding) as similarity
  from doctrine
  where 1 - (doctrine.embedding <=> query_embedding) > match_threshold
  order by doctrine.embedding <=> query_embedding
  limit match_count;
end;
$$;