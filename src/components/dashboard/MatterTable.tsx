import { useState } from 'react';
import { Matter } from '@/types/matter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit2, Trash2, MoreVertical, Eye, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatterTableProps {
  matters: Matter[];
  onEdit: (matter: Matter) => void;
  onDelete: (id: string) => void;
  onView: (matter: Matter) => void;
}

type SortField = 'caseId' | 'priority' | 'daysInProcess' | 'slaStatus';
type SortDirection = 'asc' | 'desc';

export function MatterTable({ matters, onEdit, onDelete, onView }: MatterTableProps) {
  const [sortField, setSortField] = useState<SortField>('daysInProcess');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const priorityOrder = { 'Urgent': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
  const slaOrder = { 'Overdue': 0, 'Critical': 1, 'At Risk': 2, 'Within SLA': 3, 'Completed': 4, 'Completed Overdue': 5 };

  const sortedMatters = [...matters].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'caseId':
        comparison = a.caseId.localeCompare(b.caseId);
        break;
      case 'priority':
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'daysInProcess':
        comparison = a.daysInProcess - b.daysInProcess;
        break;
      case 'slaStatus':
        comparison = slaOrder[a.slaStatus] - slaOrder[b.slaStatus];
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const getSlaStatusStyle = (status: string) => {
    switch (status) {
      case 'Within SLA':
        return 'bg-success/20 text-success border-success/30';
      case 'At Risk':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'Critical':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Overdue':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'Completed':
        return 'bg-primary/20 text-primary border-primary/30';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Medium':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'Low':
        return 'bg-muted/50 text-muted-foreground border-muted';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-auto p-0 hover:bg-transparent text-muted-foreground hover:text-primary"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto scrollbar-gold">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground">
                <SortButton field="caseId">Case ID</SortButton>
              </TableHead>
              <TableHead className="text-muted-foreground">Title</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">
                <SortButton field="priority">Priority</SortButton>
              </TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">
                <SortButton field="daysInProcess">Days</SortButton>
              </TableHead>
              <TableHead className="text-muted-foreground">
                <SortButton field="slaStatus">SLA</SortButton>
              </TableHead>
              <TableHead className="text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMatters.map((matter, index) => (
              <TableRow 
                key={matter.id}
                className={cn(
                  'border-border/30 hover:bg-secondary/30 transition-colors cursor-pointer',
                  'animate-fade-in'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => onView(matter)}
              >
                <TableCell className="font-mono text-sm text-primary hover:underline">
                  {matter.caseId}
                </TableCell>
                <TableCell className="max-w-[200px] truncate font-medium">
                  {matter.caseTitle}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {matter.caseType}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getPriorityStyle(matter.priority)}>
                    {matter.priority}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[150px]">
                  <span className="text-sm line-clamp-1">{matter.overallStatus}</span>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    'font-mono text-sm',
                    matter.daysInProcess > 30 ? 'text-destructive' : 
                    matter.daysInProcess > 14 ? 'text-warning' : 'text-foreground'
                  )}>
                    {matter.daysInProcess}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getSlaStatusStyle(matter.slaStatus)}>
                    {matter.slaStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border">
                      <DropdownMenuItem onClick={() => onView(matter)} className="cursor-pointer">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(matter)} className="cursor-pointer">
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(matter.id)} 
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {matters.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          No matters found matching your filters.
        </div>
      )}
    </div>
  );
}
