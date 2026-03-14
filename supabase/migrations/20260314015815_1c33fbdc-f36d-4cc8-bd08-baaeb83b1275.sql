ALTER TABLE public.attachment_overseas
  ADD COLUMN dept_memo_ref TEXT DEFAULT NULL,
  ADD COLUMN dept_memo_date DATE DEFAULT NULL,
  ADD COLUMN office_memo_ref TEXT DEFAULT NULL,
  ADD COLUMN office_memo_date DATE DEFAULT NULL;