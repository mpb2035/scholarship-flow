
-- Retirement fund settings per user
CREATE TABLE public.retirement_fund (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  fund_name TEXT NOT NULL DEFAULT 'Retirement Fund',
  biweekly_contribution NUMERIC NOT NULL DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_amount NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.retirement_fund ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own retirement fund" ON public.retirement_fund FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own retirement fund" ON public.retirement_fund FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own retirement fund" ON public.retirement_fund FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own retirement fund" ON public.retirement_fund FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_retirement_fund_updated_at BEFORE UPDATE ON public.retirement_fund FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Retirement fund contributions (manual logs every 2 weeks)
CREATE TABLE public.retirement_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  fund_id UUID NOT NULL REFERENCES public.retirement_fund(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  pay_period INTEGER NOT NULL DEFAULT 1,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.retirement_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own retirement contributions" ON public.retirement_contributions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own retirement contributions" ON public.retirement_contributions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own retirement contributions" ON public.retirement_contributions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own retirement contributions" ON public.retirement_contributions FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_retirement_contributions_updated_at BEFORE UPDATE ON public.retirement_contributions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
