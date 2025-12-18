-- Drop the old match_memories function without filter_conversation_id parameter
DROP FUNCTION IF EXISTS public.match_memories(vector, double precision, integer);