-- 1. Enable Vector Math
create extension if not exists vector;

-- 2. Add the Storage Column
alter table solace_logs add column embedding vector(768);

-- 3. Create the Search Function
create or replace function match_memories (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  user_txt text,
  ai_response text,
  similarity float,
  conversation_id uuid,
  created_at timestamptz
)
language plpgsql
as $$
begin
  return query
  select
    solace_logs.user_txt,
    solace_logs.ai_response,
    1 - (solace_logs.embedding <=> query_embedding) as similarity,
    solace_logs.conversation_id,
    solace_logs.created_at
  from solace_logs
  where 1 - (solace_logs.embedding <=> query_embedding) > match_threshold
  order by solace_logs.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 4. Add Index for Performance
create index on solace_logs using ivfflat (embedding vector_cosine_ops) with (lists = 100);