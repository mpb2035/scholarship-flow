import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { ProjectCard } from '@/components/workflow/ProjectCard';
import { ProjectDetailModal } from '@/components/workflow/ProjectDetailModal';
import { CreateProjectDialog } from '@/components/workflow/CreateProjectDialog';
import { Button } from '@/components/ui/button';
import { Plus, FolderKanban } from 'lucide-react';

const STORAGE_KEY = 'project-workflow-data';

export default function ProjectWorkflow() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Load projects from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved projects:', e);
      }
    }
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const handleCreateProject = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev]);
  };

  const handleOpenProject = (project: Project) => {
    setSelectedProject(project);
    setIsDetailOpen(true);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => 
      prev.map(p => p.id === updatedProject.id ? updatedProject : p)
    );
    setSelectedProject(updatedProject);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedProject(null);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Project Workflow</h1>
          <p className="text-muted-foreground mt-1">
            Manage your projects, tasks, and track progress
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderKanban className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Create your first project to start tracking tasks, blockers, and notes.
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Add New Project Card */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="min-h-[160px] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer bg-card/50"
          >
            <Plus className="h-8 w-8" />
            <span className="font-medium">Add Project</span>
          </button>

          {/* Project Cards */}
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={handleOpenProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateProjectDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateProject}
      />

      <ProjectDetailModal
        project={selectedProject}
        open={isDetailOpen}
        onClose={handleCloseDetail}
        onUpdate={handleUpdateProject}
      />
    </div>
  );
}
