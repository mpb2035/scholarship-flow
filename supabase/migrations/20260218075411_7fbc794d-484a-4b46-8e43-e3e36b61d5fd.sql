
-- Table to store user-defined custom options for dropdowns
CREATE TABLE public.custom_dropdown_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  field_name TEXT NOT NULL, -- e.g. 'case_type', 'department'
  option_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, field_name, option_value)
);

ALTER TABLE public.custom_dropdown_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own custom options" ON public.custom_dropdown_options
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom options" ON public.custom_dropdown_options
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom options" ON public.custom_dropdown_options
  FOR DELETE USING (auth.uid() = user_id);
