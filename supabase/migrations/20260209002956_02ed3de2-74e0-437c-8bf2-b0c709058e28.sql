-- Add pay_period column to expenses table to track which biweekly pay period (1 or 2) an expense belongs to
-- NULL means it's a regular monthly expense, 1 or 2 means it's tied to that pay period
ALTER TABLE public.expenses 
ADD COLUMN pay_period INTEGER CHECK (pay_period IS NULL OR pay_period IN (1, 2));