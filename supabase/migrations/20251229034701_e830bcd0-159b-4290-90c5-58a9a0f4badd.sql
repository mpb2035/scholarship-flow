-- Create table for playground scorecards
CREATE TABLE public.playground_scorecards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dashboard_title TEXT NOT NULL DEFAULT 'My Playground',
  indicators JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.playground_scorecards ENABLE ROW LEVEL SECURITY;

-- Users can view their own scorecards
CREATE POLICY "Users can view their own scorecards"
ON public.playground_scorecards
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own scorecards
CREATE POLICY "Users can insert their own scorecards"
ON public.playground_scorecards
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own scorecards
CREATE POLICY "Users can update their own scorecards"
ON public.playground_scorecards
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own scorecards
CREATE POLICY "Users can delete their own scorecards"
ON public.playground_scorecards
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_playground_scorecards_updated_at
BEFORE UPDATE ON public.playground_scorecards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();