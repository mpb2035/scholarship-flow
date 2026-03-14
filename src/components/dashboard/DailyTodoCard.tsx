import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, Trash2, Play, Pause, Clock, Target, ChevronDown, ChevronRight, 
  Edit2, Check, GripVertical, ListTodo 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TodoWithSubTodos, SubTodo, Todo } from '@/types/todo';

interface DailyTodoCardProps {
  todos: TodoWithSubTodos[];
  isLoading: boolean;
  onCreateTodo: (title: string) => Promise<any>;
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void;
  onDeleteTodo: (id: string) => void;
  onCreateSubTodo: (todoId: string, title: string) => void;
  onUpdateSubTodo: (id: string, updates: Partial<SubTodo>) => void;
  onDeleteSubTodo: (id: string) => void;
}

function formatTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function LiveTimer({ elapsed, isRunning, onToggle, onTick, size = 'sm' }: {
  elapsed: number;
  isRunning: boolean;
  onToggle: () => void;
  onTick: (s: number) => void;
  size?: 'sm' | 'lg';
}) {
  const [local, setLocal] = useState(elapsed);

  useEffect(() => { setLocal(elapsed); }, [elapsed]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setLocal(prev => {
        const next = prev + 1;
        if (next % 10 === 0) onTick(next);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, onTick]);

  const isLg = size === 'lg';

  return (
    <div className="flex items-center gap-1.5">
      <span className={cn(
        'font-mono tabular-nums',
        isLg ? 'text-base font-bold text-primary' : 'text-xs text-muted-foreground',
        isRunning && 'text-primary'
      )}>
        {formatTime(local)}
      </span>
      <Button
        variant={isRunning ? 'secondary' : 'ghost'}
        size="icon"
        className={cn(isLg ? 'h-7 w-7' : 'h-5 w-5')}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
      >
        {isRunning ? (
          <Pause className={cn(isLg ? 'h-3.5 w-3.5' : 'h-3 w-3')} />
        ) : (
          <Play className={cn(isLg ? 'h-3.5 w-3.5' : 'h-3 w-3')} />
        )}
      </Button>
    </div>
  );
}

function InlineSubTodo({ sub, onUpdate, onDelete }: {
  sub: SubTodo;
  onUpdate: (id: string, u: Partial<SubTodo>) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(sub.title);

  const save = () => {
    if (title.trim()) onUpdate(sub.id, { title: title.trim() });
    setEditing(false);
  };

  const handleTick = useCallback((s: number) => {
    onUpdate(sub.id, { timer_elapsed_seconds: s });
  }, [sub.id, onUpdate]);

  return (
    <div className={cn(
      'flex items-center gap-2 py-1.5 px-2 rounded-md group transition-all',
      sub.is_done ? 'opacity-50' : 'hover:bg-muted/50'
    )}>
      <GripVertical className="h-3 w-3 text-muted-foreground/30 shrink-0" />
      <Checkbox
        checked={sub.is_done}
        onCheckedChange={() => onUpdate(sub.id, { is_done: !sub.is_done, is_timer_running: false })}
        className="shrink-0"
      />
      {editing ? (
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          className="h-6 text-xs flex-1"
          autoFocus
        />
      ) : (
        <span
          onClick={() => setEditing(true)}
          className={cn(
            'text-xs flex-1 cursor-pointer truncate',
            sub.is_done && 'line-through text-muted-foreground'
          )}
        >
          {sub.title}
        </span>
      )}
      <LiveTimer
        elapsed={sub.timer_elapsed_seconds}
        isRunning={sub.is_timer_running}
        onToggle={() => onUpdate(sub.id, { is_timer_running: !sub.is_timer_running })}
        onTick={handleTick}
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(sub.id)}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

function TodoRow({ todo, onUpdate, onDelete, onCreateSub, onUpdateSub, onDeleteSub }: {
  todo: TodoWithSubTodos;
  onUpdate: (id: string, u: Partial<Todo>) => void;
  onDelete: (id: string) => void;
  onCreateSub: (todoId: string, title: string) => void;
  onUpdateSub: (id: string, u: Partial<SubTodo>) => void;
  onDeleteSub: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [newStep, setNewStep] = useState('');

  const done = todo.sub_todos.filter(s => s.is_done).length;
  const total = todo.sub_todos.length;
  const progress = total > 0 ? (done / total) * 100 : 0;

  const save = () => {
    if (title.trim()) onUpdate(todo.id, { title: title.trim() });
    setEditing(false);
  };

  const handleMainTick = useCallback((s: number) => {
    onUpdate(todo.id, { main_timer_elapsed_seconds: s });
  }, [todo.id, onUpdate]);

  const addStep = () => {
    if (newStep.trim()) {
      onCreateSub(todo.id, newStep.trim());
      setNewStep('');
    }
  };

  return (
    <div className={cn(
      'rounded-lg border transition-all',
      todo.is_main_timer_running ? 'border-primary/40 bg-primary/5' : 'bg-card',
      progress === 100 && total > 0 && 'border-green-500/30 bg-green-500/5'
    )}>
      {/* Main row */}
      <div className="flex items-center gap-2 p-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 shrink-0"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </Button>

        {editing ? (
          <div className="flex items-center gap-1 flex-1">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={save}
              onKeyDown={(e) => e.key === 'Enter' && save()}
              className="h-7 text-sm flex-1"
              autoFocus
            />
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={save}>
              <Check className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span
              onClick={() => setEditing(true)}
              className={cn(
                'text-sm font-medium cursor-pointer truncate hover:text-primary transition-colors',
                progress === 100 && total > 0 && 'text-green-600 dark:text-green-400'
              )}
            >
              {todo.title}
            </span>
            {total > 0 && (
              <Badge variant={progress === 100 ? 'default' : 'secondary'} className={cn(
                'text-[10px] px-1.5 py-0',
                progress === 100 && 'bg-green-600'
              )}>
                {done}/{total}
              </Badge>
            )}
          </div>
        )}

        <LiveTimer
          elapsed={todo.main_timer_elapsed_seconds}
          isRunning={todo.is_main_timer_running}
          onToggle={() => onUpdate(todo.id, { is_main_timer_running: !todo.is_main_timer_running })}
          onTick={handleMainTick}
          size="lg"
        />

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
          onClick={() => onDelete(todo.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="px-3 pb-1">
          <Progress value={progress} className="h-1" />
        </div>
      )}

      {/* Expanded sub-todos */}
      {expanded && (
        <div className="px-3 pb-3 space-y-1">
          {todo.sub_todos.map(sub => (
            <InlineSubTodo
              key={sub.id}
              sub={sub}
              onUpdate={onUpdateSub}
              onDelete={onDeleteSub}
            />
          ))}
          <div className="flex items-center gap-2 pt-1">
            <Input
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addStep()}
              placeholder="Add step..."
              className="h-7 text-xs flex-1"
            />
            <Button size="icon" className="h-7 w-7" onClick={addStep} disabled={!newStep.trim()}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DailyTodoCard({
  todos, isLoading,
  onCreateTodo, onUpdateTodo, onDeleteTodo,
  onCreateSubTodo, onUpdateSubTodo, onDeleteSubTodo,
}: DailyTodoCardProps) {
  const [newTitle, setNewTitle] = useState('');

  // Filter to today's tasks or tasks with active timers
  const today = new Date().toISOString().split('T')[0];
  const dailyTodos = todos.filter(t => {
    const createdDate = t.created_at.split('T')[0];
    return createdDate === today || t.is_main_timer_running || t.sub_todos.some(s => s.is_timer_running);
  });

  // Summary stats
  const totalTime = todos.reduce((acc, t) => acc + t.main_timer_elapsed_seconds, 0);
  const activeTasks = todos.filter(t => t.is_main_timer_running).length;
  const allSubDone = dailyTodos.reduce((a, t) => a + t.sub_todos.filter(s => s.is_done).length, 0);
  const allSubTotal = dailyTodos.reduce((a, t) => a + t.sub_todos.length, 0);

  const handleCreate = async () => {
    if (newTitle.trim()) {
      await onCreateTodo(newTitle.trim());
      setNewTitle('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
          <Target className="h-4 w-4 text-primary" />
          <div>
            <div className="text-sm font-bold">{dailyTodos.length}</div>
            <div className="text-[10px] text-muted-foreground">Today</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
          <Clock className="h-4 w-4 text-amber-500" />
          <div>
            <div className="text-sm font-bold">{formatTime(totalTime)}</div>
            <div className="text-[10px] text-muted-foreground">Total</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
          <Check className="h-4 w-4 text-green-500" />
          <div>
            <div className="text-sm font-bold">{allSubDone}/{allSubTotal}</div>
            <div className="text-[10px] text-muted-foreground">Steps</div>
          </div>
        </div>
      </div>

      {/* Quick add */}
      <div className="flex gap-2">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="What needs to be done today?"
          className="flex-1"
        />
        <Button size="sm" onClick={handleCreate} disabled={!newTitle.trim()}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {/* Todo list */}
      {dailyTodos.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <ListTodo className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No tasks for today</p>
          <p className="text-xs">Add a task to start tracking your day</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[350px] overflow-y-auto">
          {dailyTodos.map(todo => (
            <TodoRow
              key={todo.id}
              todo={todo}
              onUpdate={onUpdateTodo}
              onDelete={onDeleteTodo}
              onCreateSub={onCreateSubTodo}
              onUpdateSub={onUpdateSubTodo}
              onDeleteSub={onDeleteSubTodo}
            />
          ))}
        </div>
      )}

      {activeTasks > 0 && (
        <div className="flex items-center gap-2 text-xs text-primary animate-pulse">
          <Clock className="h-3 w-3" />
          {activeTasks} timer{activeTasks > 1 ? 's' : ''} running
        </div>
      )}
    </div>
  );
}
