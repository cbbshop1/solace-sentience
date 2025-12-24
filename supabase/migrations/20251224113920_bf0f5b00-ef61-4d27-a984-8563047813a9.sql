-- Add reasoning column to solace_logs table for storing AI reasoning traces
ALTER TABLE public.solace_logs 
ADD COLUMN reasoning text DEFAULT NULL;