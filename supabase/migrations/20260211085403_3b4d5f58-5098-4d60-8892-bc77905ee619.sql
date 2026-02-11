ALTER TABLE public.matters 
  ADD COLUMN received_from text DEFAULT NULL,
  ADD COLUMN suthe_pass_to_department text DEFAULT NULL,
  ADD COLUMN suthe_pass_to_department_date date DEFAULT NULL;