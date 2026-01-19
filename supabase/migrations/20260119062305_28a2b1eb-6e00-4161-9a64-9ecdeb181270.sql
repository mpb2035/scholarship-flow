-- Create a table for attachment overseas programmes
CREATE TABLE public.attachment_overseas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  matter_id UUID NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,
  institution TEXT NOT NULL CHECK (institution IN ('PB', 'IBTE')),
  programmes TEXT[] NOT NULL DEFAULT '{}',
  program_start_date DATE NOT NULL,
  program_end_date DATE NOT NULL,
  funding_type TEXT NOT NULL CHECK (funding_type IN ('Self Funded', 'Organizer Funded')),
  country TEXT NOT NULL,
  destination_institution TEXT NOT NULL,
  student_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.attachment_overseas ENABLE ROW LEVEL SECURITY;

-- Admins can view all attachment overseas records
CREATE POLICY "Admins can view all attachment overseas records"
ON public.attachment_overseas
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert attachment overseas records
CREATE POLICY "Admins can insert attachment overseas records"
ON public.attachment_overseas
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update attachment overseas records
CREATE POLICY "Admins can update attachment overseas records"
ON public.attachment_overseas
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete attachment overseas records
CREATE POLICY "Admins can delete attachment overseas records"
ON public.attachment_overseas
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view all attachment overseas records (read-only)
CREATE POLICY "Users can view attachment overseas records"
ON public.attachment_overseas
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_attachment_overseas_updated_at
BEFORE UPDATE ON public.attachment_overseas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();