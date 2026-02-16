
ALTER TABLE public.monthly_commitment_tracking
ADD COLUMN pay_period integer NOT NULL DEFAULT 0;

-- Drop the existing unique constraint if any, and add a new one including pay_period
CREATE UNIQUE INDEX IF NOT EXISTS unique_commitment_tracking_per_period
ON public.monthly_commitment_tracking (user_id, commitment_id, month, year, pay_period);
