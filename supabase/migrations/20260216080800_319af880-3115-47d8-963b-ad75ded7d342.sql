
-- Create net worth entries table for tracking assets, loans, savings over time
CREATE TABLE public.net_worth_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('asset', 'loan', 'saving')),
  label TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.net_worth_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own net worth entries"
ON public.net_worth_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own net worth entries"
ON public.net_worth_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own net worth entries"
ON public.net_worth_entries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own net worth entries"
ON public.net_worth_entries FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_net_worth_entries_updated_at
BEFORE UPDATE ON public.net_worth_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
