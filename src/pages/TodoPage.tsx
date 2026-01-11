import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ListTodo, Loader2 } from 'lucide-react';
import { useTodos } from '@/hooks/useTodos';
import { TodoCard } from '@/components/todo/TodoCard';
import { useAuth } from '@/hooks/useAuth';

export default function TodoPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { todos, isLoading, createTodo, updateTodo, deleteTodo, createSubTodo, updateSubTodo, deleteSubTodo } = useTodos();
  const [newTodoTitle, setNewTodoTitle] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleCreateTodo = async () => {
    if (newTodoTitle.trim()) {
      await createTodo(newTodoTitle.trim());
      setNewTodoTitle('');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ListTodo className="h-6 w-6 text-primary" />
            To Do
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your tasks with timers and progress tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="New task title..."
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateTodo()}
            className="w-64"
          />
          <Button onClick={handleCreateTodo} disabled={!newTodoTitle.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-primary">{todos.length}</div>
          <div className="text-sm text-muted-foreground">Total Tasks</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {todos.filter(t => t.sub_todos.length > 0 && t.sub_todos.every(st => st.is_done)).length}
          </div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-amber-600">
            {todos.filter(t => t.is_main_timer_running).length}
          </div>
          <div className="text-sm text-muted-foreground">In Progress</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-muted-foreground">
            {todos.reduce((acc, t) => acc + t.sub_todos.length, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Steps</div>
        </div>
      </div>

      {/* Todo Cards Grid */}
      {todos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ListTodo className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No tasks yet</h3>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Create your first task to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onUpdateTodo={updateTodo}
              onDeleteTodo={deleteTodo}
              onCreateSubTodo={createSubTodo}
              onUpdateSubTodo={updateSubTodo}
              onDeleteSubTodo={deleteSubTodo}
            />
          ))}
        </div>
      )}
    </div>
  );
}
