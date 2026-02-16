
CREATE TABLE public.financial_section_order (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  section_order TEXT[] NOT NULL DEFAULT '{"pay_settings","fixed_commitments","monthly_scorecard","savings_tracker","biweekly_overview","pay_period_tabs"}'::text[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_section_order ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own section order" ON public.financial_section_order FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own section order" ON public.financial_section_order FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own section order" ON public.financial_section_order FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own section order" ON public.financial_section_order FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_financial_section_order_updated_at BEFORE UPDATE ON public.financial_section_order FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
