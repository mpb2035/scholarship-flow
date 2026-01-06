import { useState, useEffect, useMemo } from 'react';
import { WorkflowTask } from '@/types/workflowTask';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO, format } from 'date-fns';

interface WorkflowTasksViewProps {
  tasks: WorkflowTask[];
  onTasksChange: (tasks: WorkflowTask[]) => void;
  onSave: () => void;
  hasUnsavedChanges: boolean;
}

export function WorkflowTasksView({ 
  tasks, 
  onTasksChange, 
  onSave,
  hasUnsavedChanges 
}: WorkflowTasksViewProps) {
  const today = new Date();

  const updateTask = (taskId: string, updates: Partial<WorkflowTask>) => {
    const updatedTasks = tasks.map(t => {
      if (t.id !== taskId) return t;
      
      const updated = { ...t, ...updates };
      
      // If marking as done, freeze the days elapsed counter
      if (updates.isDone === true && t.startDate) {
        const startDate = parseISO(t.startDate);
        const endDate = updated.completionDate ? parseISO(updated.completionDate) : today;
        updated.frozenDaysElapsed = Math.max(0, differenceInDays(endDate, startDate));
        // Auto-set completion date if not set
        if (!updated.completionDate) {
          updated.completionDate = format(today, 'yyyy-MM-dd');
        }
      }
      
      // If unchecking done, unfreeze the counter
      if (updates.isDone === false) {
        updated.frozenDaysElapsed = null;
      }
      
      return updated;
    });
    
    onTasksChange(updatedTasks);
  };

  const calculateDaysElapsed = (task: WorkflowTask): number | null => {
    if (task.frozenDaysElapsed !== null) return task.frozenDaysElapsed;
    if (!task.startDate) return null;
    
    const startDate = parseISO(task.startDate);
    return Math.max(0, differenceInDays(today, startDate));
  };

  const calculateDaysFromDates = (task: WorkflowTask): number | null => {
    if (!task.startDate || !task.completionDate) return null;
    return Math.max(0, differenceInDays(parseISO(task.completionDate), parseISO(task.startDate)));
  };

  const isOverdue = (task: WorkflowTask): boolean => {
    if (task.isDone) return false;
    const daysElapsed = calculateDaysElapsed(task);
    if (daysElapsed === null) return false;
    return daysElapsed > task.slaTarget;
  };

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => a.stepOrder - b.stepOrder);
  }, [tasks]);

  return (
    <div className="space-y-4">
      {/* Save Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{tasks.filter(t => t.isDone).length} / {tasks.length} completed</span>
          {hasUnsavedChanges && (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-300">
              Unsaved changes
            </Badge>
          )}
        </div>
        <Button 
          onClick={onSave} 
          disabled={!hasUnsavedChanges}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Tasks Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[60px] text-center">Done</TableHead>
              <TableHead className="min-w-[300px]">Workflow Details</TableHead>
              <TableHead className="w-[100px] text-center">SLA Target</TableHead>
              <TableHead className="w-[280px]">Date Management</TableHead>
              <TableHead className="w-[120px] text-center">Days Elapsed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.map((task) => {
              const daysElapsed = calculateDaysElapsed(task);
              const daysFromDates = calculateDaysFromDates(task);
              const overdue = isOverdue(task);
              
              return (
                <TableRow 
                  key={task.id}
                  className={cn(
                    overdue && 'bg-red-500/10 hover:bg-red-500/15',
                    task.isDone && 'bg-emerald-500/5'
                  )}
                >
                  {/* Column A: Done Checkbox */}
                  <TableCell className="text-center">
                    <Checkbox
                      checked={task.isDone}
                      onCheckedChange={(checked) => 
                        updateTask(task.id, { isDone: checked as boolean })
                      }
                      className="h-5 w-5"
                    />
                  </TableCell>

                  {/* Column B: Workflow Details (Editable) */}
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs shrink-0">
                          Step {task.stepOrder}
                        </Badge>
                        <Input
                          value={task.title}
                          onChange={(e) => updateTask(task.id, { title: e.target.value })}
                          className={cn(
                            "font-medium bg-transparent border-dashed border-muted-foreground/30 focus:border-primary",
                            task.isDone && "line-through text-muted-foreground"
                          )}
                          placeholder="Step title..."
                        />
                      </div>
                      <Textarea
                        value={task.description}
                        onChange={(e) => updateTask(task.id, { description: e.target.value })}
                        className="text-sm bg-transparent border-dashed border-muted-foreground/30 focus:border-primary min-h-[60px]"
                        placeholder="Step description..."
                      />
                    </div>
                  </TableCell>

                  {/* Column C: SLA Target (Read-only) */}
                  <TableCell className="text-center">
                    <Badge 
                      variant="secondary" 
                      className="font-mono"
                    >
                      {task.slaTarget} days
                    </Badge>
                  </TableCell>

                  {/* Column D: Date Management */}
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-16">Start:</span>
                        <Input
                          type="date"
                          value={task.startDate || ''}
                          onChange={(e) => updateTask(task.id, { startDate: e.target.value || null })}
                          className="text-sm bg-background"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-16">End:</span>
                        <Input
                          type="date"
                          value={task.completionDate || ''}
                          onChange={(e) => updateTask(task.id, { completionDate: e.target.value || null })}
                          className="text-sm bg-background"
                        />
                      </div>
                      {daysFromDates !== null && (
                        <div className="text-xs text-muted-foreground pl-[72px]">
                          Duration: {daysFromDates} days
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Column E: Automated Counter */}
                  <TableCell className="text-center">
                    {daysElapsed !== null ? (
                      <div className={cn(
                        "flex items-center justify-center gap-1 font-mono text-lg",
                        overdue ? 'text-red-500' : 
                        task.isDone ? 'text-emerald-500' : 'text-foreground'
                      )}>
                        {task.isDone ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : overdue ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                        <span>{daysElapsed}</span>
                        {task.frozenDaysElapsed !== null && (
                          <span className="text-xs text-muted-foreground">(frozen)</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No workflow tasks. This project was not created from a workflow template.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Legend */}
      <div className="flex gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500/20" />
          <span>Overdue (Days Elapsed &gt; SLA Target)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500/20" />
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
}
