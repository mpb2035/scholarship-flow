
ALTER TABLE public.meetings 
ADD COLUMN attendees text[] NOT NULL DEFAULT '{}'::text[],
ADD COLUMN required_items text[] NOT NULL DEFAULT '{}'::text[];
