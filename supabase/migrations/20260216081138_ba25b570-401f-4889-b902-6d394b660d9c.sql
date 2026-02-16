
-- Create loan tracker table
CREATE TABLE public.loan_tracker (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  loan_type TEXT NOT NULL DEFAULT 'personal_loan',
  label TEXT NOT NULL,
  initial_amount NUMERIC NOT NULL DEFAULT 0,
  current_balance NUMERIC NOT NULL DEFAULT 0,
  biweekly_repayment NUMERIC NOT NULL DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.loan_tracker ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own loans"
ON public.loan_tracker FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own loans"
ON public.loan_tracker FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loans"
ON public.loan_tracker FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loans"
ON public.loan_tracker FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_loan_tracker_updated_at
BEFORE UPDATE ON public.loan_tracker
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
