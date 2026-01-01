import { useState } from 'react';
import { Project, ProjectTask, ProjectNote } from '@/hooks/useProjects';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Circle,
  X,
  Pencil,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectDetailModalProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (project: Project) => void;
}

const statusColors: Record<Project['status'], string> = {
  'on-track': 'bg-emerald-500',
  'at-risk': 'bg-amber-500',
  'delayed': 'bg-red-500',
  'completed': 'bg-blue-500',
};

const priorityColors = {
  low: 'bg-slate-500/20 text-slate-600',
  medium: 'bg-amber-500/20 text-amber-600',
  high: 'bg-red-500/20 text-red-600',
};

const taskStatusIcons = {
  'todo': Circle,
  'in-progress': Clock,
  'done': CheckCircle2,
};

export function ProjectDetailModal({ project, open, onClose, onUpdate }: ProjectDetailModalProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newBlocker, setNewBlocker] = useState('');
  const [newNote, setNewNote] = useState('');

  if (!project) return null;

  const handleTitleSave = () => {
    if (newTitle.trim()) {
      onUpdate({ ...project, title: newTitle.trim(), updatedAt: new Date().toISOString() });
    }
    setEditingTitle(false);
  };

  const handleStatusChange = (status: Project['status']) => {
    onUpdate({ ...project, status, updatedAt: new Date().toISOString() });
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: ProjectTask = {
      id: crypto.randomUUID(),
      title: newTaskTitle.trim(),
      status: 'todo',
      priority: 'medium',
      createdAt: new Date().toISOString(),
    };
    onUpdate({ 
      ...project, 
      tasks: [...project.tasks, newTask],
      updatedAt: new Date().toISOString() 
    });
    setNewTaskTitle('');
  };

  const handleTaskStatusChange = (taskId: string, status: ProjectTask['status']) => {
    const updatedTasks = project.tasks.map(t => 
      t.id === taskId ? { ...t, status } : t
    );
    onUpdate({ ...project, tasks: updatedTasks, updatedAt: new Date().toISOString() });
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdate({ 
      ...project, 
      tasks: project.tasks.filter(t => t.id !== taskId),
      updatedAt: new Date().toISOString() 
    });
  };

  const handleAddBlocker = () => {
    if (!newBlocker.trim()) return;
    onUpdate({ 
      ...project, 
      blockers: [...project.blockers, newBlocker.trim()],
      updatedAt: new Date().toISOString() 
    });
    setNewBlocker('');
  };

  const handleRemoveBlocker = (index: number) => {
    const updatedBlockers = project.blockers.filter((_, i) => i !== index);
    onUpdate({ ...project, blockers: updatedBlockers, updatedAt: new Date().toISOString() });
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: ProjectNote = {
      id: crypto.randomUUID(),
      content: newNote.trim(),
      tags: [],
      createdAt: new Date().toISOString(),
    };
    onUpdate({ 
      ...project, 
      notes: [...project.notes, note],
      updatedAt: new Date().toISOString() 
    });
    setNewNote('');
  };

  const handleDeleteNote = (noteId: string) => {
    onUpdate({ 
      ...project, 
      notes: project.notes.filter(n => n.id !== noteId),
      updatedAt: new Date().toISOString() 
    });
  };

  const completedTasks = project.tasks.filter(t => t.status === 'done').length;
  const totalTasks = project.tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-stone-50 text-gray-900 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-3">
            {editingTitle ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="text-xl font-bold bg-white border-gray-300 text-gray-900"
                  autoFocus
                />
                <Button size="icon" variant="ghost" onClick={handleTitleSave}>
                  <Save className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setEditingTitle(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <DialogTitle 
                className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-gray-700 flex items-center gap-2"
                onClick={() => { setNewTitle(project.title); setEditingTitle(true); }}
              >
                {project.title}
                <Pencil className="h-4 w-4 opacity-50" />
              </DialogTitle>
            )}
            <Select value={project.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-32 bg-white border-gray-300 text-gray-800">
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', statusColors[project.status])} />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="on-track">On Track</SelectItem>
                <SelectItem value="at-risk">At Risk</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1">
          <TabsList className="mx-6 bg-stone-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white text-gray-700">Overview</TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-white text-gray-700">Tasks</TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-white text-gray-700">Notes & Insights</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] p-6">
            <TabsContent value="overview" className="mt-0 space-y-6">
              {/* Weekly Scorecard */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Weekly Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-gray-900">{progressPercent}%</div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-sm text-gray-600">
                      <span>{completedTasks} completed</span>
                      <span>{totalTasks - completedTasks} remaining</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-amber-50 border-amber-200">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium text-amber-800 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Blockers
                    </CardTitle>
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                      {project.blockers.length} Active
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {project.blockers.length === 0 ? (
                      <p className="text-sm text-amber-700">No blockers</p>
                    ) : (
                      project.blockers.map((blocker, index) => (
                        <div key={index} className="flex items-start justify-between gap-2 text-sm">
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                            <span className="text-gray-800">{blocker}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 shrink-0"
                            onClick={() => handleRemoveBlocker(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    )}
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Add blocker..."
                        value={newBlocker}
                        onChange={(e) => setNewBlocker(e.target.value)}
                        className="text-sm bg-white border-amber-300 text-gray-900"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddBlocker()}
                      />
                      <Button size="sm" onClick={handleAddBlocker} className="shrink-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Recent Tasks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {project.tasks.slice(0, 5).map((task) => {
                    const StatusIcon = taskStatusIcons[task.status];
                    return (
                      <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <StatusIcon className={cn(
                            'h-4 w-4',
                            task.status === 'done' ? 'text-emerald-500' : 
                            task.status === 'in-progress' ? 'text-blue-500' : 'text-gray-400'
                          )} />
                          <span className={cn(
                            'text-sm text-gray-800',
                            task.status === 'done' && 'line-through text-gray-500'
                          )}>
                            {task.title}
                          </span>
                        </div>
                        <Badge className={cn('text-xs', priorityColors[task.priority])}>
                          {task.priority}
                        </Badge>
                      </div>
                    );
                  })}
                  {project.tasks.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No tasks yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="mt-0 space-y-4">
              {/* Add Task */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a new task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                />
                <Button onClick={handleAddTask}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>

              {/* Task List */}
              <div className="space-y-2">
                {project.tasks.map((task) => {
                  const StatusIcon = taskStatusIcons[task.status];
                  return (
                    <Card key={task.id} className="bg-white border-gray-200">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Select 
                            value={task.status} 
                            onValueChange={(value) => handleTaskStatusChange(task.id, value as ProjectTask['status'])}
                          >
                            <SelectTrigger className="w-10 h-8 p-0 border-0 bg-transparent">
                              <StatusIcon className={cn(
                                'h-5 w-5',
                                task.status === 'done' ? 'text-emerald-500' : 
                                task.status === 'in-progress' ? 'text-blue-500' : 'text-gray-400'
                              )} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="todo">To Do</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="done">Done</SelectItem>
                            </SelectContent>
                          </Select>
                          <span className={cn(
                            'text-sm text-gray-800',
                            task.status === 'done' && 'line-through text-gray-500'
                          )}>
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={cn('text-xs', priorityColors[task.priority])}>
                            {task.priority}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {project.tasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Circle className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>No tasks yet. Add your first task above.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-0 space-y-4">
              {/* Add Note */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Quick thoughts from the meeting..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 min-h-[80px]"
                />
                <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                  <Plus className="h-4 w-4 mr-1" /> Add Note
                </Button>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                {project.notes.map((note) => (
                  <Card key={note.id} className="bg-white border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(note.createdAt).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
                {project.notes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No notes yet. Start capturing your thoughts.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
