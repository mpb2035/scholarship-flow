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
import { Edit2, Trash2, MoreVertical, Eye, ArrowUpDown, Copy, FolderKanban, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { differenceInDays, format } from 'date-fns';
import * as XLSX from 'xlsx';
interface MatterTableProps {
  matters: Matter[];
  onEdit: (matter: Matter) => void;
  onDelete: (id: string) => void;
  onView: (matter: Matter) => void;
  onConvertToProject?: (matter: Matter) => void;
}

type SortField = 'caseId' | 'priority' | 'daysInProcess' | 'slaStatus';
type SortDirection = 'asc' | 'desc';

export function MatterTable({ matters, onEdit, onDelete, onView, onConvertToProject }: MatterTableProps) {
  const [sortField, setSortField] = useState<SortField>('daysInProcess');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const { toast } = useToast();

  // Calculate time since last response for a matter
  const calculateTimeSinceLastResponse = (matter: Matter): { days: number; label: string } => {
    const today = new Date();
    
    // Find the most recent response date
    const dates = [
      matter.queryResponseDate ? new Date(matter.queryResponseDate) : null,
      matter.secondQueryResponseDate ? new Date(matter.secondQueryResponseDate) : null,
      matter.sutheReceivedDate ? new Date(matter.sutheReceivedDate) : null,
    ].filter(Boolean) as Date[];
    
    if (dates.length === 0) {
      return { days: matter.daysInProcess, label: `${matter.daysInProcess} days (since received)` };
    }
    
    const lastResponseDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const days = differenceInDays(today, lastResponseDate);
    return { days, label: `${days} days since ${format(lastResponseDate, 'dd MMM yyyy')}` };
  };

  // Calculate SLA countdown
  const calculateSLACountdown = (matter: Matter): { daysRemaining: number; label: string } => {
    if (matter.slaStatus === 'Completed' || matter.slaStatus === 'Completed Overdue') {
      return { daysRemaining: 0, label: 'Completed' };
    }
    
    const daysRemaining = matter.overallSlaDays - matter.daysInProcess;
    if (daysRemaining <= 0) {
      return { daysRemaining, label: `${Math.abs(daysRemaining)} days overdue` };
    }
    return { daysRemaining, label: `${daysRemaining} days remaining` };
  };

  // Export In Process matters to Excel
  const handleExportInProcess = () => {
    const inProcessMatters = matters.filter(m => 
      m.overallStatus !== 'Approved & Signed' && 
      m.overallStatus !== 'Not Approved'
    );

    if (inProcessMatters.length === 0) {
      toast({
        title: "No data to export",
        description: "No in-process matters found",
        variant: "destructive",
      });
      return;
    }

    const excelData = inProcessMatters.map((matter) => {
      const timeSinceLastResponse = calculateTimeSinceLastResponse(matter);
      const slaCountdown = calculateSLACountdown(matter);
      
      return {
        'Case ID': matter.caseId,
        'Case Title': matter.caseTitle,
        'Case Type': matter.caseType,
        'Priority': matter.priority,
        'Overall Status': matter.overallStatus,
        'Days in Process': matter.daysInProcess,
        'SLA Days Allowed': matter.overallSlaDays,
        'SLA Countdown': slaCountdown.label,
        'Days Remaining': slaCountdown.daysRemaining,
        'Time Since Last Response': timeSinceLastResponse.label,
        'Days Since Last Response': timeSinceLastResponse.days,
        'Query Status': matter.queryStatus,
        'Second Query Status': matter.secondQueryStatus || 'No Query',
        'Query Days Pending (SUT HE)': matter.queryDaysPendingSutHe,
        'Query Days Pending (Higher Up)': matter.queryDaysPendingHigherUp,
        'Days SUT HE to HU': matter.daysSutHeToHu,
        'SLA Status': matter.slaStatus,
        'Dept Submitted Date': matter.dsmSubmittedDate,
        'SUT HE Received Date': matter.sutheReceivedDate,
        'SUT HE Submitted to HU Date': matter.sutheSubmittedToHuDate || '',
        'Query Issued Date': matter.queryIssuedDate || '',
        'Query Response Date': matter.queryResponseDate || '',
        'Second Query Issued Date': matter.secondQueryIssuedDate || '',
        'Second Query Response Date': matter.secondQueryResponseDate || '',
        'Deadline': matter.deadline || '',
        'Assigned To': matter.assignedTo || '',
        'Remarks': matter.remarks || '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Auto-size columns
    const maxWidth = 40;
    const colWidths = Object.keys(excelData[0] || {}).map((key) => ({
      wch: Math.min(maxWidth, Math.max(key.length, ...excelData.map(row => String(row[key as keyof typeof row] || '').length)))
    }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'In Process Matters');

    const filename = `in_process_matters_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, filename);
    
    toast({
      title: "Export Successful",
      description: `Exported ${inProcessMatters.length} in-process matters to Excel`,
    });
  };

  const handleCopyRow = async (e: React.MouseEvent, matter: Matter) => {
    e.stopPropagation();
    const copyText = `${matter.caseId} - ${matter.caseTitle} - ${matter.caseType} - Priority: ${matter.priority} - Status: ${matter.overallStatus} - Days: ${matter.daysInProcess} - SLA: ${matter.slaStatus}`;
    
    try {
      await navigator.clipboard.writeText(copyText);
      toast({
        title: "Copied!",
        description: "Row details copied to clipboard",
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

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

  const inProcessCount = matters.filter(m => 
    m.overallStatus !== 'Approved & Signed' && 
    m.overallStatus !== 'Not Approved'
  ).length;

  return (
    <div className="glass-card overflow-hidden">
      {/* Table Header with Export Button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <h3 className="text-sm font-medium text-muted-foreground">
          Matters ({matters.length})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportInProcess}
          className="border-success/50 text-success hover:bg-success/10"
          disabled={inProcessCount === 0}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export In Process ({inProcessCount})
        </Button>
      </div>
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
                <TableCell className="font-mono text-sm text-primary">
                  <div className="flex items-center gap-1">
                    <span className="hover:underline">{matter.caseId}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-50 hover:opacity-100 hover:bg-secondary/50"
                      onClick={(e) => handleCopyRow(e, matter)}
                      title="Copy row details"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
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
                      {onConvertToProject && (
                        <DropdownMenuItem 
                          onClick={() => onConvertToProject(matter)} 
                          className="cursor-pointer text-primary focus:text-primary"
                        >
                          <FolderKanban className="mr-2 h-4 w-4" />
                          Convert to Project
                        </DropdownMenuItem>
                      )}
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
