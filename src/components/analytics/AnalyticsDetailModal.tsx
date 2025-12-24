import { useState, useMemo } from 'react';
import { Download, ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Matter } from '@/types/matter';

interface AnalyticsDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  matters: Matter[];
}

type SortField = 'dsmSubmittedDate' | 'overallStatus' | 'caseType' | 'priority' | 'caseId';
type SortDirection = 'asc' | 'desc';

export function AnalyticsDetailModal({ 
  open, 
  onOpenChange, 
  title, 
  matters 
}: AnalyticsDetailModalProps) {
  const [sortField, setSortField] = useState<SortField>('dsmSubmittedDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedMatters = useMemo(() => {
    return [...matters].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'dsmSubmittedDate':
          comparison = new Date(a.dsmSubmittedDate).getTime() - new Date(b.dsmSubmittedDate).getTime();
          break;
        case 'overallStatus':
          comparison = a.overallStatus.localeCompare(b.overallStatus);
          break;
        case 'caseType':
          comparison = a.caseType.localeCompare(b.caseType);
          break;
        case 'priority':
          const priorityOrder = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'caseId':
          comparison = a.caseId.localeCompare(b.caseId);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [matters, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1" /> 
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const handleExport = () => {
    const excelData = sortedMatters.map((matter) => ({
      'Case ID': matter.caseId,
      'Case Title': matter.caseTitle,
      'Case Type': matter.caseType,
      'Priority': matter.priority,
      'Submitted Date': matter.dsmSubmittedDate,
      'Overall Status': matter.overallStatus,
      'SLA Status': matter.slaStatus,
      'Days in Process': matter.daysInProcess,
      'Remarks': matter.remarks || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cases');

    const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_report.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'destructive';
      case 'High': return 'default';
      case 'Medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] bg-card border-border">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="font-display text-lg gold-text">
            {title}
          </DialogTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-2 border-primary/50 hover:bg-primary/10 text-primary"
          >
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </DialogHeader>

        <div className="overflow-auto max-h-[60vh]">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:text-primary"
                  onClick={() => handleSort('caseId')}
                >
                  <div className="flex items-center">
                    Case ID {getSortIcon('caseId')}
                  </div>
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-primary"
                  onClick={() => handleSort('caseType')}
                >
                  <div className="flex items-center">
                    Type {getSortIcon('caseType')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-primary"
                  onClick={() => handleSort('dsmSubmittedDate')}
                >
                  <div className="flex items-center">
                    Date {getSortIcon('dsmSubmittedDate')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-primary"
                  onClick={() => handleSort('overallStatus')}
                >
                  <div className="flex items-center">
                    Status {getSortIcon('overallStatus')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-primary"
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center">
                    Priority {getSortIcon('priority')}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMatters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No cases found
                  </TableCell>
                </TableRow>
              ) : (
                sortedMatters.map((matter) => (
                  <TableRow key={matter.id}>
                    <TableCell className="font-mono text-sm">{matter.caseId}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{matter.caseTitle}</TableCell>
                    <TableCell className="text-xs">{matter.caseType}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(matter.dsmSubmittedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs whitespace-nowrap">
                        {matter.overallStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityVariant(matter.priority)}>
                        {matter.priority}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-border/50">
          <span className="text-sm text-muted-foreground">
            {sortedMatters.length} {sortedMatters.length === 1 ? 'case' : 'cases'} total
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
