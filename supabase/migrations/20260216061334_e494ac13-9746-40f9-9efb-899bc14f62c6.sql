
-- Create fixed_commitments table for recurring payments split between pay periods
CREATE TABLE public.fixed_commitments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  pay_period INTEGER NOT NULL DEFAULT 1, -- 1 or 2
  category TEXT NOT NULL DEFAULT 'other', -- car, utilities, phone, home, baby, grocery, wife, other
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fixed_commitments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fixed commitments"
ON public.fixed_commitments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fixed commitments"
ON public.fixed_commitments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fixed commitments"
ON public.fixed_commitments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fixed commitments"
ON public.fixed_commitments FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_fixed_commitments_updated_at
BEFORE UPDATE ON public.fixed_commitments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
