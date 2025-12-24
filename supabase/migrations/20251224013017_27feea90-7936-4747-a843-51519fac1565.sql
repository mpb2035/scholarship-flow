-- Add external_link column to matters table
ALTER TABLE public.matters 
ADD COLUMN external_link text NULL;