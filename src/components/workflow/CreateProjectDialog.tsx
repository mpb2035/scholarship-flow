import { useState, useEffect } from 'react';
import { Project } from '@/hooks/useProjects';
import { WorkflowTask } from '@/types/workflowTask';
import { useWorkflowTemplates } from '@/hooks/useWorkflowTemplates';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, GitBranch } from 'lucide-react';

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function CreateProjectDialog({ open, onClose, onCreate }: CreateProjectDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('none');
  const [loadingSteps, setLoadingSteps] = useState(false);
  
  const { templates, loading: loadingTemplates, fetchWorkflowSteps } = useWorkflowTemplates();

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTitle('');
      setDescription('');
      setSelectedWorkflow('none');
    }
  }, [open]);

  const handleCreate = async () => {
    if (!title.trim()) return;

    let workflowTasks: WorkflowTask[] = [];
    let workflowTemplateName: string | undefined;

    // If a workflow template is selected, fetch and convert steps to tasks
    if (selectedWorkflow && selectedWorkflow !== 'none') {
      setLoadingSteps(true);
      try {
        const steps = await fetchWorkflowSteps(selectedWorkflow);
        workflowTasks = steps.map(step => ({
          id: crypto.randomUUID(),
          stepOrder: step.step_order,
          title: step.step_title,
          description: step.step_description || '',
          slaTarget: step.estimated_days || 1,
          isDone: false,
          startDate: null,
          completionDate: null,
          frozenDaysElapsed: null,
        }));
        workflowTemplateName = selectedWorkflow;
      } catch (error) {
        console.error('Error fetching workflow steps:', error);
      } finally {
        setLoadingSteps(false);
      }
    }

    const newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      description: description.trim() || undefined,
      status: 'on-track',
      tasks: [],
      notes: [],
      blockers: [],
      workflowTasks,
      workflowTemplateName,
    };

    onCreate(newProject);
    setTitle('');
    setDescription('');
    setSelectedWorkflow('none');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              placeholder="e.g., Housing Reform, Budget 2025..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workflow" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Workflow Template (optional)
            </Label>
            <Select 
              value={selectedWorkflow} 
              onValueChange={setSelectedWorkflow}
              disabled={loadingTemplates}
            >
              <SelectTrigger className="w-full">
                {loadingTemplates ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading templates...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Select a workflow template..." />
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-muted-foreground">No workflow template</span>
                </SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template} value={template}>
                    {template}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedWorkflow && selectedWorkflow !== 'none' && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  <GitBranch className="h-3 w-3 mr-1" />
                  {selectedWorkflow}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Workflow steps will be imported as tasks
                </span>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleCreate} 
            disabled={!title.trim() || loadingSteps}
          >
            {loadingSteps ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Project'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
