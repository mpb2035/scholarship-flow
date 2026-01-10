-- Create a table for running logs
CREATE TABLE public.running_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  distance DECIMAL(5,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  pace_per_km DECIMAL(4,2),
  environment TEXT NOT NULL DEFAULT 'outdoor' CHECK (environment IN ('indoor', 'outdoor')),
  run_type TEXT NOT NULL DEFAULT 'easy_run' CHECK (run_type IN ('easy_run', 'tempo', 'fartlek', 'interval', 'long_run', 'race')),
  notes TEXT,
  is_planned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.running_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own running logs" 
ON public.running_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own running logs" 
ON public.running_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own running logs" 
ON public.running_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own running logs" 
ON public.running_logs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_running_logs_updated_at
BEFORE UPDATE ON public.running_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();