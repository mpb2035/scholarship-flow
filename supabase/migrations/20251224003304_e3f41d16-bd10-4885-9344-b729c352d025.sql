-- Add new date column for SUT HE submitted to Higher Up
ALTER TABLE public.matters 
ADD COLUMN suthe_submitted_to_hu_date date;

-- Add comment for clarity
COMMENT ON COLUMN public.matters.suthe_submitted_to_hu_date IS 'Date when SUT HE submitted the matter to Higher Up for approval';