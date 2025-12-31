import { Project } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  onOpen: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

const statusColors: Record<Project['status'], string> = {
  'on-track': 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
  'at-risk': 'bg-amber-500/20 text-amber-700 border-amber-500/30',
  'delayed': 'bg-red-500/20 text-red-700 border-red-500/30',
  'completed': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
};

const statusLabels: Record<Project['status'], string> = {
  'on-track': 'On Track',
  'at-risk': 'At Risk',
  'delayed': 'Delayed',
  'completed': 'Completed',
};

export function ProjectCard({ project, onOpen, onDelete }: ProjectCardProps) {
  const completedTasks = project.tasks.filter(t => t.status === 'done').length;
  const totalTasks = project.tasks.length;

  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-200 bg-card border-border/50 hover:border-primary/30"
      onClick={() => onOpen(project)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-foreground line-clamp-1">
            {project.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={cn('text-xs', statusColors[project.status])}>
              {statusLabels[project.status]}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project.id);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              Tasks: <span className="text-foreground font-medium">{completedTasks}/{totalTasks}</span>
            </span>
            {project.blockers.length > 0 && (
              <span className="text-red-500">
                {project.blockers.length} Blocker{project.blockers.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>

        {project.weeklyScore !== undefined && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${project.weeklyScore}%` }}
              />
            </div>
            <span className="text-xs font-medium text-foreground">{project.weeklyScore}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
