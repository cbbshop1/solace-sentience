-- Fix security: Set search_path for match_memories function
create or replace function match_memories (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_conversation_id uuid
)
returns table (
  user_txt text,
  ai_response text,
  similarity float,
  conversation_id uuid,
  created_at timestamptz
)
language plpgsql
SET search_path = public
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
  and solace_logs.conversation_id = filter_conversation_id
  order by solace_logs.embedding <=> query_embedding
  limit match_count;
end;
$$;