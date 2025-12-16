-- Fix 1: Set search_path on match_memories function for security
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
security invoker
set search_path = public
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