-- Add deadline column to matters table
ALTER TABLE public.matters 
ADD COLUMN deadline date DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.matters.deadline IS 'Optional deadline date for the matter';