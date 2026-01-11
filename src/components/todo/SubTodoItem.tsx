import { useState, useCallback } from 'react';
import { SubTodo } from '@/types/todo';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical } from 'lucide-react';
import { TodoTimer } from './TodoTimer';
import { cn } from '@/lib/utils';

interface SubTodoItemProps {
  subTodo: SubTodo;
  stepNumber: number;
  onUpdate: (id: string, updates: Partial<SubTodo>) => void;
  onDelete: (id: string) => void;
}

export function SubTodoItem({ subTodo, stepNumber, onUpdate, onDelete }: SubTodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(subTodo.title);

  const handleToggleDone = () => {
    onUpdate(subTodo.id, { 
      is_done: !subTodo.is_done,
      is_timer_running: false // Stop timer when marking done
    });
  };

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      onUpdate(subTodo.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleToggleTimer = () => {
    onUpdate(subTodo.id, { is_timer_running: !subTodo.is_timer_running });
  };

  const handleTick = useCallback((seconds: number) => {
    // Debounce database updates - only update every 10 seconds
    if (seconds % 10 === 0) {
      onUpdate(subTodo.id, { timer_elapsed_seconds: seconds });
    }
  }, [subTodo.id, onUpdate]);

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-lg border transition-all',
      subTodo.is_done 
        ? 'bg-muted/50 border-muted' 
        : 'bg-card border-border hover:border-primary/30'
    )}>
      <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
      
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
        {stepNumber}
      </div>

      <Checkbox 
        checked={subTodo.is_done}
        onCheckedChange={handleToggleDone}
        className="shrink-0"
      />

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
            className="h-7 text-sm"
            autoFocus
          />
        ) : (
          <span 
            onClick={() => setIsEditing(true)}
            className={cn(
              'text-sm cursor-pointer hover:text-primary transition-colors truncate block',
              subTodo.is_done && 'line-through text-muted-foreground'
            )}
          >
            {subTodo.title}
          </span>
        )}
      </div>

      <TodoTimer
        elapsedSeconds={subTodo.timer_elapsed_seconds}
        isRunning={subTodo.is_timer_running}
        onToggle={handleToggleTimer}
        onTick={handleTick}
        size="sm"
      />

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(subTodo.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
