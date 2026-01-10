-- Add column to link running logs to training plan dates
ALTER TABLE public.running_logs 
ADD COLUMN linked_training_date DATE;