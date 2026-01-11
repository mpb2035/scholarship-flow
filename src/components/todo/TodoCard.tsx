import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, Check } from 'lucide-react';
import { TodoWithSubTodos, SubTodo, Todo } from '@/types/todo';
import { TodoTimer } from './TodoTimer';
import { SubTodoItem } from './SubTodoItem';
import { cn } from '@/lib/utils';

interface TodoCardProps {
  todo: TodoWithSubTodos;
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void;
  onDeleteTodo: (id: string) => void;
  onCreateSubTodo: (todoId: string, title: string) => void;
  onUpdateSubTodo: (id: string, updates: Partial<SubTodo>) => void;
  onDeleteSubTodo: (id: string) => void;
}

export function TodoCard({
  todo,
  onUpdateTodo,
  onDeleteTodo,
  onCreateSubTodo,
  onUpdateSubTodo,
  onDeleteSubTodo,
}: TodoCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [newSubTodoTitle, setNewSubTodoTitle] = useState('');

  const completedCount = todo.sub_todos.filter(st => st.is_done).length;
  const totalCount = todo.sub_todos.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      onUpdateTodo(todo.id, { title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleToggleMainTimer = () => {
    onUpdateTodo(todo.id, { is_main_timer_running: !todo.is_main_timer_running });
  };

  const handleMainTimerTick = useCallback((seconds: number) => {
    // Debounce database updates - only update every 10 seconds
    if (seconds % 10 === 0) {
      onUpdateTodo(todo.id, { main_timer_elapsed_seconds: seconds });
    }
  }, [todo.id, onUpdateTodo]);

  const handleAddSubTodo = () => {
    if (newSubTodoTitle.trim()) {
      onCreateSubTodo(todo.id, newSubTodoTitle.trim());
      setNewSubTodoTitle('');
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-lg font-semibold"
                  autoFocus
                />
                <Button size="icon" variant="ghost" onClick={handleSaveTitle}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold truncate">{todo.title}</h3>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDeleteTodo(todo.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <TodoTimer
            elapsedSeconds={todo.main_timer_elapsed_seconds}
            isRunning={todo.is_main_timer_running}
            onToggle={handleToggleMainTimer}
            onTick={handleMainTimerTick}
            size="lg"
          />

          <div className="text-sm text-muted-foreground">
            {completedCount}/{totalCount} completed
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              'h-full transition-all duration-300',
              progressPercent === 100 ? 'bg-green-500' : 'bg-primary'
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Sub todos list - ladder style */}
        <div className="space-y-2">
          {todo.sub_todos.map((subTodo, index) => (
            <SubTodoItem
              key={subTodo.id}
              subTodo={subTodo}
              stepNumber={index + 1}
              onUpdate={onUpdateSubTodo}
              onDelete={onDeleteSubTodo}
            />
          ))}
        </div>

        {/* Add new sub todo */}
        <div className="flex items-center gap-2 pt-2">
          <Input
            placeholder="Add a step..."
            value={newSubTodoTitle}
            onChange={(e) => setNewSubTodoTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSubTodo()}
            className="flex-1"
          />
          <Button size="icon" onClick={handleAddSubTodo} disabled={!newSubTodoTitle.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
