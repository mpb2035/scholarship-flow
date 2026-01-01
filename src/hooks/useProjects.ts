import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { Json } from '@/integrations/supabase/types';

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
  sourceMatterId?: string;
  createdAt: string;
  updatedAt: string;
}

interface DBProject {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  tasks: unknown;
  notes: unknown;
  blockers: string[];
  weekly_score: number | null;
  source_matter_id: string | null;
  created_at: string;
  updated_at: string;
}

const mapDBToProject = (db: DBProject): Project => ({
  id: db.id,
  title: db.title,
  description: db.description || undefined,
  status: db.status as Project['status'],
  tasks: (db.tasks as ProjectTask[]) || [],
  notes: (db.notes as ProjectNote[]) || [],
  blockers: db.blockers || [],
  weeklyScore: db.weekly_score || undefined,
  sourceMatterId: db.source_matter_id || undefined,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

export function useProjects() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects((data || []).map(mapDBToProject));
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = useCallback(async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        user_id: user.id,
        title: project.title,
        description: project.description || null,
        status: project.status,
        tasks: JSON.parse(JSON.stringify(project.tasks)) as Json,
        notes: JSON.parse(JSON.stringify(project.notes)) as Json,
        blockers: project.blockers,
        weekly_score: project.weeklyScore || null,
        source_matter_id: project.sourceMatterId || null,
      }])
      .select()
      .single();

    if (error) throw error;
    
    const newProject = mapDBToProject(data);
    setProjects(prev => [newProject, ...prev]);
    return newProject;
  }, [user]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    if (!user) throw new Error('Not authenticated');

    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.tasks !== undefined) dbUpdates.tasks = JSON.parse(JSON.stringify(updates.tasks)) as Json;
    if (updates.notes !== undefined) dbUpdates.notes = JSON.parse(JSON.stringify(updates.notes)) as Json;
    if (updates.blockers !== undefined) dbUpdates.blockers = updates.blockers;
    if (updates.weeklyScore !== undefined) dbUpdates.weekly_score = updates.weeklyScore;

    const { data, error } = await supabase
      .from('projects')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    
    const updatedProject = mapDBToProject(data);
    setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
    return updatedProject;
  }, [user]);

  const deleteProject = useCallback(async (id: string) => {
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    setProjects(prev => prev.filter(p => p.id !== id));
  }, [user]);

  const createProjectFromMatter = useCallback(async (matter: {
    id: string;
    caseId: string;
    caseTitle: string;
    caseType: string;
    priority: string;
    overallStatus: string;
  }) => {
    const project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
      title: `${matter.caseId} - ${matter.caseTitle}`,
      description: `Converted from matter: ${matter.caseType}\nPriority: ${matter.priority}\nStatus: ${matter.overallStatus}`,
      status: 'on-track',
      tasks: [],
      notes: [],
      blockers: [],
      sourceMatterId: matter.id,
    };

    return createProject(project);
  }, [createProject]);

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    createProjectFromMatter,
    refreshProjects: fetchProjects,
  };
}
