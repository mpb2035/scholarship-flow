import { useState, useMemo } from 'react';
import { useProjects, Project } from '@/hooks/useProjects';
import { ProjectCard } from '@/components/workflow/ProjectCard';
import { ProjectDetailModal } from '@/components/workflow/ProjectDetailModal';
import { CreateProjectDialog } from '@/components/workflow/CreateProjectDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, FolderKanban, Search, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc';
type StatusFilter = 'all' | 'on-track' | 'at-risk' | 'delayed' | 'completed';

export default function ProjectWorkflow() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects();
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return result;
  }, [projects, searchQuery, statusFilter, sortOption]);

  const handleCreateProject = async (newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createProject(newProject);
      toast({
        title: 'Project Created',
        description: 'Your new project has been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create project.',
        variant: 'destructive',
      });
    }
  };

  const handleOpenProject = (project: Project) => {
    setSelectedProject(project);
    setIsDetailOpen(true);
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    try {
      await updateProject(updatedProject.id, updatedProject);
      setSelectedProject(updatedProject);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update project.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      toast({
        title: 'Project Deleted',
        description: 'The project has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete project.',
        variant: 'destructive',
      });
    }
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedProject(null);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all';

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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

      {/* Filter/Sort Controls */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="on-track">On Track</SelectItem>
              <SelectItem value="at-risk">At Risk</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Selector */}
          <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Date: Newest First</SelectItem>
              <SelectItem value="oldest">Date: Oldest First</SelectItem>
              <SelectItem value="title-asc">Title: A-Z</SelectItem>
              <SelectItem value="title-desc">Title: Z-A</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-muted-foreground">
          Showing {filteredAndSortedProjects.length} of {projects.length} projects
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderKanban className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Create your first project to start tracking tasks, blockers, and notes.
            You can also convert matters from the Dashboard.
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Project
          </Button>
        </div>
      ) : filteredAndSortedProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No matching projects</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search or filters.
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
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
          {filteredAndSortedProjects.map((project) => (
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
