export interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface ProjectNote {
  id: string;
  content: string;
  tags: string[];
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  status: 'on-track' | 'at-risk' | 'delayed' | 'completed';
  description?: string;
  tasks: ProjectTask[];
  notes: ProjectNote[];
  weeklyScore?: number;
  blockers: string[];
  createdAt: string;
  updatedAt: string;
}
