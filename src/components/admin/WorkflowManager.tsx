import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Loader2, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  Save,
  ChevronRight 
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface WorkflowStep {
  id: string;
  workflow_name: string;
  step_order: number;
  step_title: string;
  step_description: string | null;
  responsible_party: string | null;
  estimated_days: number | null;
}

const WORKFLOW_TEMPLATES = [
  'Standard Matter Processing',
  'Ministerial Inquiry',
  'Budget Approval',
  'Policy Review',
  'Scholarship Processing',
  'Custom Workflow',
];

export function WorkflowManager() {
  const { toast } = useToast();
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('Standard Matter Processing');
  const [newWorkflowName, setNewWorkflowName] = useState('');

  useEffect(() => {
    fetchSteps();
  }, [selectedWorkflow]);

  const fetchSteps = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('workflow_name', selectedWorkflow)
        .order('step_order');

      if (error) throw error;
      setSteps(data || []);
    } catch (err) {
      console.error('Error fetching workflow steps:', err);
      toast({
        title: 'Error',
        description: 'Failed to load workflow steps.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStep = async () => {
    const newOrder = steps.length > 0 ? Math.max(...steps.map(s => s.step_order)) + 1 : 1;
    
    try {
      const { data, error } = await supabase
        .from('workflow_steps')
        .insert({
          workflow_name: selectedWorkflow,
          step_order: newOrder,
          step_title: `Step ${newOrder}`,
          step_description: '',
          responsible_party: '',
          estimated_days: 1,
        })
        .select()
        .single();

      if (error) throw error;
      setSteps(prev => [...prev, data]);
      toast({
        title: 'Step Added',
        description: 'New workflow step created.',
      });
    } catch (err) {
      console.error('Error adding step:', err);
      toast({
        title: 'Error',
        description: 'Failed to add step.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStep = async (step: WorkflowStep, field: keyof WorkflowStep, value: string | number) => {
    // Update local state immediately
    setSteps(prev => prev.map(s => s.id === step.id ? { ...s, [field]: value } : s));
  };

  const handleSaveStep = async (step: WorkflowStep) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('workflow_steps')
        .update({
          step_title: step.step_title,
          step_description: step.step_description,
          responsible_party: step.responsible_party,
          estimated_days: step.estimated_days,
        })
        .eq('id', step.id);

      if (error) throw error;
      toast({
        title: 'Step Saved',
        description: `"${step.step_title}" updated successfully.`,
      });
    } catch (err) {
      console.error('Error saving step:', err);
      toast({
        title: 'Error',
        description: 'Failed to save step.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('Are you sure you want to delete this step?')) return;

    try {
      const { error } = await supabase
        .from('workflow_steps')
        .delete()
        .eq('id', stepId);

      if (error) throw error;
      setSteps(prev => prev.filter(s => s.id !== stepId));
      toast({
        title: 'Step Deleted',
        description: 'Workflow step removed.',
      });
    } catch (err) {
      console.error('Error deleting step:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete step.',
        variant: 'destructive',
      });
    }
  };

  const handleMoveStep = async (stepId: string, direction: 'up' | 'down') => {
    const index = steps.findIndex(s => s.id === stepId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === steps.length - 1) return;

    const newSteps = [...steps];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap orders
    const tempOrder = newSteps[index].step_order;
    newSteps[index].step_order = newSteps[swapIndex].step_order;
    newSteps[swapIndex].step_order = tempOrder;

    // Swap positions
    [newSteps[index], newSteps[swapIndex]] = [newSteps[swapIndex], newSteps[index]];
    setSteps(newSteps);

    // Save to database
    try {
      await supabase
        .from('workflow_steps')
        .update({ step_order: newSteps[index].step_order })
        .eq('id', newSteps[index].id);
      
      await supabase
        .from('workflow_steps')
        .update({ step_order: newSteps[swapIndex].step_order })
        .eq('id', newSteps[swapIndex].id);
    } catch (err) {
      console.error('Error reordering steps:', err);
    }
  };

  const handleSaveAllSteps = async () => {
    setSaving(true);
    try {
      for (const step of steps) {
        const { error } = await supabase
          .from('workflow_steps')
          .update({
            step_title: step.step_title,
            step_description: step.step_description,
            responsible_party: step.responsible_party,
            estimated_days: step.estimated_days,
            step_order: step.step_order,
          })
          .eq('id', step.id);

        if (error) throw error;
      }
      toast({
        title: 'Workflow Saved',
        description: 'All workflow steps saved successfully.',
      });
    } catch (err) {
      console.error('Error saving workflow:', err);
      toast({
        title: 'Error',
        description: 'Failed to save workflow.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportToExcel = () => {
    const exportData = steps.map((step, index) => ({
      'Step #': index + 1,
      'Step Title': step.step_title,
      'Description': step.step_description || '',
      'Responsible Party': step.responsible_party || '',
      'Estimated Days': step.estimated_days || 1,
      'Next Step': index < steps.length - 1 ? steps[index + 1].step_title : 'End',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Workflow');

    // Add flowchart sheet
    const flowchartData = steps.map((step, index) => ({
      'Step': `[${index + 1}] ${step.step_title}`,
      'Arrow': index < steps.length - 1 ? '→' : '✓',
      'Next': index < steps.length - 1 ? `[${index + 2}] ${steps[index + 1].step_title}` : 'Complete',
      'Owner': step.responsible_party || '-',
      'Days': step.estimated_days || 1,
    }));

    const wsFlow = XLSX.utils.json_to_sheet(flowchartData);
    XLSX.utils.book_append_sheet(wb, wsFlow, 'Flowchart');

    // Download
    XLSX.writeFile(wb, `${selectedWorkflow.replace(/\s+/g, '_')}_Workflow.xlsx`);

    toast({
      title: 'Export Complete',
      description: 'Workflow exported to Excel successfully.',
    });
  };

  const handleCreateWorkflow = async () => {
    if (!newWorkflowName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a workflow name.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedWorkflow(newWorkflowName.trim());
    setNewWorkflowName('');
    setSteps([]);
    toast({
      title: 'New Workflow',
      description: `Created "${newWorkflowName.trim()}". Add steps to define the process.`,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Workflow Manager</CardTitle>
          <CardDescription>
            Create and edit process workflows with step-by-step flowcharts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Workflow Selection */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Select Workflow</label>
              <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORKFLOW_TEMPLATES.map(template => (
                    <SelectItem key={template} value={template}>
                      {template}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Or Create New</label>
              <div className="flex gap-2">
                <Input
                  placeholder="New workflow name..."
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                />
                <Button onClick={handleCreateWorkflow} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAddStep} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
            <Button onClick={handleSaveAllSteps} disabled={saving || steps.length === 0} className="gold-glow">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Workflow
            </Button>
            <Button onClick={handleExportToExcel} variant="outline" disabled={steps.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          </div>

          {/* Flowchart Preview */}
          {steps.length > 0 && (
            <div className="bg-secondary/30 rounded-lg p-4 overflow-x-auto">
              <div className="flex items-center gap-2 min-w-max">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className="bg-primary/20 border border-primary/50 rounded-lg px-4 py-2 text-center min-w-[120px]">
                      <div className="text-xs text-muted-foreground">Step {index + 1}</div>
                      <div className="font-medium text-sm truncate max-w-[150px]">{step.step_title}</div>
                      {step.responsible_party && (
                        <div className="text-xs text-muted-foreground">{step.responsible_party}</div>
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <ChevronRight className="h-6 w-6 text-primary mx-2 flex-shrink-0" />
                    )}
                  </div>
                ))}
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg px-4 py-2 text-center">
                  <div className="text-xs text-muted-foreground">End</div>
                  <div className="font-medium text-sm text-green-600">Complete</div>
                </div>
              </div>
            </div>
          )}

          {/* Steps Editor */}
          <div className="space-y-4">
            {steps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No steps defined. Click "Add Step" to start building your workflow.
              </div>
            ) : (
              steps.map((step, index) => (
                <Card key={step.id} className="bg-secondary/20 border-border/50">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      {/* Step Number */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center font-bold text-primary">
                          {index + 1}
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleMoveStep(step.id, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleMoveStep(step.id, 'down')}
                            disabled={index === steps.length - 1}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Step Details */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-muted-foreground">Step Title</label>
                          <Input
                            value={step.step_title}
                            onChange={(e) => handleUpdateStep(step, 'step_title', e.target.value)}
                            placeholder="Step title..."
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Responsible Party</label>
                          <Input
                            value={step.responsible_party || ''}
                            onChange={(e) => handleUpdateStep(step, 'responsible_party', e.target.value)}
                            placeholder="Who is responsible..."
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs text-muted-foreground">Description</label>
                          <Textarea
                            value={step.step_description || ''}
                            onChange={(e) => handleUpdateStep(step, 'step_description', e.target.value)}
                            placeholder="Describe what happens in this step..."
                            rows={2}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Estimated Days</label>
                          <Input
                            type="number"
                            min={1}
                            max={365}
                            value={step.estimated_days || 1}
                            onChange={(e) => handleUpdateStep(step, 'estimated_days', parseInt(e.target.value) || 1)}
                            className="w-24"
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSaveStep(step)}
                          className="text-primary"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteStep(step.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}