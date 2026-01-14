-- Add second query columns to matters table
ALTER TABLE public.matters 
ADD COLUMN second_query_status TEXT DEFAULT 'No Query',
ADD COLUMN second_query_issued_date DATE,
ADD COLUMN second_query_response_date DATE;