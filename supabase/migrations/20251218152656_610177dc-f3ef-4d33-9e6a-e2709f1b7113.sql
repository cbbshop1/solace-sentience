-- 1. MODIFY match_memories() to accept an optional conversation_id parameter
CREATE OR REPLACE FUNCTION public.match_memories(
    query_embedding vector, 
    match_threshold double precision, 
    match_count integer,
    filter_conversation_id uuid DEFAULT NULL
)
 RETURNS TABLE(user_txt text, ai_response text, similarity double precision, conversation_id uuid, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  return query
  select
    solace_logs.user_txt,
    solace_logs.ai_response,
    1 - (solace_logs.embedding <=> query_embedding) as similarity,
    solace_logs.conversation_id,
    solace_logs.created_at
  from solace_logs
  where (1 - (solace_logs.embedding <=> query_embedding) > match_threshold)
    AND (filter_conversation_id IS NULL OR solace_logs.conversation_id = filter_conversation_id)
  order by solace_logs.embedding <=> query_embedding
  limit match_count;
end;
$function$;

-- 2. CREATE match_doctrine() function for vault-only searches
CREATE OR REPLACE FUNCTION public.match_doctrine(
    query_embedding vector, 
    match_threshold double precision, 
    match_count integer
)
 RETURNS TABLE(user_txt text, ai_response text, similarity double precision, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  return query
  select
    solace_logs.user_txt,
    solace_logs.ai_response,
    1 - (solace_logs.embedding <=> query_embedding) as similarity,
    solace_logs.created_at
  from solace_logs
  where (1 - (solace_logs.embedding <=> query_embedding) > match_threshold)
    AND solace_logs.conversation_id = '00000000-0000-0000-0000-000000000000'
  order by solace_logs.embedding <=> query_embedding
  limit match_count;
end;
$function$;