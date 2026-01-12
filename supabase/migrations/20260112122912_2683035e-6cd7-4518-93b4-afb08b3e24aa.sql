-- Create leaves table
CREATE TABLE public.leaves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  leave_type TEXT NOT NULL DEFAULT 'annual',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_used NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leave_balances table for tracking annual entitlements
CREATE TABLE public.leave_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  year INTEGER NOT NULL,
  annual_entitlement NUMERIC NOT NULL DEFAULT 20,
  sick_entitlement NUMERIC NOT NULL DEFAULT 14,
  other_entitlement NUMERIC NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, year)
);

-- Enable RLS
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;

-- RLS policies for leaves
CREATE POLICY "Users can view their own leaves" ON public.leaves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own leaves" ON public.leaves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own leaves" ON public.leaves FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own leaves" ON public.leaves FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for leave_balances
CREATE POLICY "Users can view their own leave balances" ON public.leave_balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own leave balances" ON public.leave_balances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own leave balances" ON public.leave_balances FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own leave balances" ON public.leave_balances FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_leaves_updated_at BEFORE UPDATE ON public.leaves FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leave_balances_updated_at BEFORE UPDATE ON public.leave_balances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();