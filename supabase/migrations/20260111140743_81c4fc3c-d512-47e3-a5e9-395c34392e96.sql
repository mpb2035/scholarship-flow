-- Create todos table for the To Do feature
CREATE TABLE public.todos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  is_main_timer_running BOOLEAN NOT NULL DEFAULT false,
  main_timer_elapsed_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sub_todos table for mini tasks
CREATE TABLE public.sub_todos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  todo_id UUID NOT NULL REFERENCES public.todos(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_done BOOLEAN NOT NULL DEFAULT false,
  step_order INTEGER NOT NULL DEFAULT 1,
  is_timer_running BOOLEAN NOT NULL DEFAULT false,
  timer_elapsed_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_todos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for todos
CREATE POLICY "Users can view their own todos" 
ON public.todos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own todos" 
ON public.todos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos" 
ON public.todos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos" 
ON public.todos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for sub_todos (via todo ownership)
CREATE POLICY "Users can view their own sub_todos" 
ON public.sub_todos 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.todos 
  WHERE todos.id = sub_todos.todo_id 
  AND todos.user_id = auth.uid()
));

CREATE POLICY "Users can create their own sub_todos" 
ON public.sub_todos 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.todos 
  WHERE todos.id = sub_todos.todo_id 
  AND todos.user_id = auth.uid()
));

CREATE POLICY "Users can update their own sub_todos" 
ON public.sub_todos 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.todos 
  WHERE todos.id = sub_todos.todo_id 
  AND todos.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own sub_todos" 
ON public.sub_todos 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.todos 
  WHERE todos.id = sub_todos.todo_id 
  AND todos.user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_todos_updated_at
BEFORE UPDATE ON public.todos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sub_todos_updated_at
BEFORE UPDATE ON public.sub_todos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();