
-- Savings goals with custom names
CREATE TABLE public.savings_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own savings goals" ON public.savings_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own savings goals" ON public.savings_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own savings goals" ON public.savings_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own savings goals" ON public.savings_goals FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON public.savings_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Individual contributions to savings goals
CREATE TABLE public.savings_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_id UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  pay_period INTEGER NOT NULL DEFAULT 1,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.savings_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contributions" ON public.savings_contributions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own contributions" ON public.savings_contributions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own contributions" ON public.savings_contributions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own contributions" ON public.savings_contributions FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_savings_contributions_updated_at BEFORE UPDATE ON public.savings_contributions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
