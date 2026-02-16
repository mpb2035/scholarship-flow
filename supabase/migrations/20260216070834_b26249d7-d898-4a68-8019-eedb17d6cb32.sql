
-- Drop the old unique constraint that blocks per-period tracking
ALTER TABLE public.monthly_commitment_tracking 
DROP CONSTRAINT monthly_commitment_tracking_commitment_id_month_year_key;
