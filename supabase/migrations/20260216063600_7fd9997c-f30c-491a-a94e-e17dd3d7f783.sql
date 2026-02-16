
-- Monthly tracking of fixed commitments (checklist + actual amount)
CREATE TABLE public.monthly_commitment_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  commitment_id UUID NOT NULL REFERENCES public.fixed_commitments(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  actual_amount NUMERIC DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  paid_date DATE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(commitment_id, month, year)
);

ALTER TABLE public.monthly_commitment_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tracking" ON public.monthly_commitment_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tracking" ON public.monthly_commitment_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracking" ON public.monthly_commitment_tracking
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracking" ON public.monthly_commitment_tracking
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_commitment_tracking_updated_at
  BEFORE UPDATE ON public.monthly_commitment_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
