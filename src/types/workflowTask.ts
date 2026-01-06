export interface WorkflowTask {
  id: string;
  stepOrder: number;
  title: string;
  description: string;
  slaTarget: number; // Estimated days from template (read-only)
  isDone: boolean;
  startDate: string | null;
  completionDate: string | null;
  frozenDaysElapsed: number | null; // Frozen when task is marked done
}

export interface WorkflowStep {
  id: string;
  workflow_name: string;
  step_order: number;
  step_title: string;
  step_description: string | null;
  responsible_party: string | null;
  estimated_days: number;
}
