-- Create table for user shortcuts/bookmarks
CREATE TABLE public.user_shortcuts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_shortcuts ENABLE ROW LEVEL SECURITY;

-- Users can only view their own shortcuts
CREATE POLICY "Users can view their own shortcuts"
ON public.user_shortcuts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own shortcuts
CREATE POLICY "Users can insert their own shortcuts"
ON public.user_shortcuts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own shortcuts
CREATE POLICY "Users can update their own shortcuts"
ON public.user_shortcuts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own shortcuts
CREATE POLICY "Users can delete their own shortcuts"
ON public.user_shortcuts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_shortcuts_updated_at
BEFORE UPDATE ON public.user_shortcuts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();