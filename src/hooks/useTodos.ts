import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Todo, SubTodo, TodoWithSubTodos } from '@/types/todo';
import { useToast } from '@/hooks/use-toast';

export function useTodos() {
  const [todos, setTodos] = useState<TodoWithSubTodos[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTodos([]);
        return;
      }

      const { data: todosData, error: todosError } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (todosError) throw todosError;

      if (!todosData || todosData.length === 0) {
        setTodos([]);
        return;
      }

      const todoIds = todosData.map(t => t.id);
      const { data: subTodosData, error: subTodosError } = await supabase
        .from('sub_todos')
        .select('*')
        .in('todo_id', todoIds)
        .order('step_order', { ascending: true });

      if (subTodosError) throw subTodosError;

      const todosWithSubTodos: TodoWithSubTodos[] = todosData.map(todo => ({
        ...todo,
        sub_todos: (subTodosData || []).filter(st => st.todo_id === todo.id)
      }));

      setTodos(todosWithSubTodos);
    } catch (error) {
      console.error('Error fetching todos:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch todos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const createTodo = async (title: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('todos')
        .insert({ title, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setTodos(prev => [{ ...data, sub_todos: [] }, ...prev]);
      toast({ title: 'Success', description: 'Todo created' });
      return data;
    } catch (error) {
      console.error('Error creating todo:', error);
      toast({
        title: 'Error',
        description: 'Failed to create todo',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setTodos(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    } catch (error) {
      console.error('Error updating todo:', error);
      toast({
        title: 'Error',
        description: 'Failed to update todo',
        variant: 'destructive',
      });
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTodos(prev => prev.filter(t => t.id !== id));
      toast({ title: 'Success', description: 'Todo deleted' });
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete todo',
        variant: 'destructive',
      });
    }
  };

  const createSubTodo = async (todoId: string, title: string) => {
    try {
      const todo = todos.find(t => t.id === todoId);
      const stepOrder = todo ? (todo.sub_todos?.length || 0) + 1 : 1;

      const { data, error } = await supabase
        .from('sub_todos')
        .insert({ todo_id: todoId, title, step_order: stepOrder })
        .select()
        .single();

      if (error) throw error;

      setTodos(prev => prev.map(t => 
        t.id === todoId 
          ? { ...t, sub_todos: [...(t.sub_todos || []), data] }
          : t
      ));
    } catch (error) {
      console.error('Error creating sub todo:', error);
      toast({
        title: 'Error',
        description: 'Failed to create sub task',
        variant: 'destructive',
      });
    }
  };

  const updateSubTodo = async (id: string, updates: Partial<SubTodo>) => {
    try {
      const { error } = await supabase
        .from('sub_todos')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setTodos(prev => prev.map(t => ({
        ...t,
        sub_todos: t.sub_todos.map(st => st.id === id ? { ...st, ...updates } : st)
      })));
    } catch (error) {
      console.error('Error updating sub todo:', error);
      toast({
        title: 'Error',
        description: 'Failed to update sub task',
        variant: 'destructive',
      });
    }
  };

  const deleteSubTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sub_todos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTodos(prev => prev.map(t => ({
        ...t,
        sub_todos: t.sub_todos.filter(st => st.id !== id)
      })));
    } catch (error) {
      console.error('Error deleting sub todo:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete sub task',
        variant: 'destructive',
      });
    }
  };

  return {
    todos,
    isLoading,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    createSubTodo,
    updateSubTodo,
    deleteSubTodo,
  };
}
