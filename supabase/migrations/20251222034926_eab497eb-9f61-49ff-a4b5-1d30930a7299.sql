-- Create the matters table (public access - no auth required)
CREATE TABLE public.matters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id TEXT NOT NULL UNIQUE,
  case_title TEXT NOT NULL,
  case_type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Medium',
  dsm_submitted_date DATE NOT NULL,
  suthe_received_date DATE NOT NULL,
  query_issued_date DATE,
  query_response_date DATE,
  signed_date DATE,
  query_status TEXT NOT NULL DEFAULT 'No Query',
  overall_status TEXT NOT NULL DEFAULT 'Pending SUT HE Review',
  overall_sla_days INTEGER NOT NULL DEFAULT 14,
  sla_status TEXT NOT NULL DEFAULT 'Within SLA',
  remarks TEXT,
  assigned_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public read/write for this use case)
ALTER TABLE public.matters ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view matters"
  ON public.matters
  FOR SELECT
  USING (true);

-- Create policy for public insert access
CREATE POLICY "Anyone can insert matters"
  ON public.matters
  FOR INSERT
  WITH CHECK (true);

-- Create policy for public update access
CREATE POLICY "Anyone can update matters"
  ON public.matters
  FOR UPDATE
  USING (true);

-- Create policy for public delete access
CREATE POLICY "Anyone can delete matters"
  ON public.matters
  FOR DELETE
  USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_matters_updated_at
  BEFORE UPDATE ON public.matters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for faster lookups
CREATE INDEX idx_matters_case_id ON public.matters(case_id);
CREATE INDEX idx_matters_overall_status ON public.matters(overall_status);
CREATE INDEX idx_matters_sla_status ON public.matters(sla_status);

-- Enable realtime for matters table
ALTER PUBLICATION supabase_realtime ADD TABLE public.matters;