-- Create a table to store GTCI Strategic Analysis document content
CREATE TABLE public.gtci_strategic_analysis (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  document_title text NOT NULL DEFAULT 'GTCI Strategic Analysis - Brunei Darussalam 2026-2030',
  executive_summary jsonb NOT NULL DEFAULT '{}',
  pillar_performance jsonb NOT NULL DEFAULT '[]',
  data_gap_indicators jsonb NOT NULL DEFAULT '[]',
  wef_participation_steps jsonb NOT NULL DEFAULT '[]',
  ministry_governance jsonb NOT NULL DEFAULT '[]',
  funding_model jsonb NOT NULL DEFAULT '[]',
  indicator_analysis jsonb NOT NULL DEFAULT '[]',
  implementation_roadmap jsonb NOT NULL DEFAULT '[]',
  expected_outcomes jsonb NOT NULL DEFAULT '[]',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.gtci_strategic_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own GTCI analysis" 
ON public.gtci_strategic_analysis 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own GTCI analysis" 
ON public.gtci_strategic_analysis 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own GTCI analysis" 
ON public.gtci_strategic_analysis 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own GTCI analysis" 
ON public.gtci_strategic_analysis 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_gtci_strategic_analysis_updated_at
BEFORE UPDATE ON public.gtci_strategic_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();