import { Search, Download, X, Clock, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Filters } from '@/hooks/useMatters';
import { OverallStatus, Priority, CaseType, SLAStatus, Matter } from '@/types/matter';
import * as XLSX from 'xlsx';

export type StatusToggle = 'all' | 'in-process' | 'completed';

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  filteredMatters: Matter[];
  statusToggle?: StatusToggle;
  onStatusToggleChange?: (value: StatusToggle) => void;
}

const statuses: (OverallStatus | 'all' | 'Completed')[] = [
  'all',
  'Completed',
  'Pending SUT HE Review',
  'In Process',
  'Dept to Respond – SUT HE Query',
  'Dept to Respond – Higher Up Query',
  'SUT HE Submitted to HU',
  'Pending Higher Up Approval',
  'Returned for Query',
  'Approved & Signed',
  'Not Approved',
];

const priorities: (Priority | 'all')[] = ['all', 'Urgent', 'High', 'Medium', 'Low'];

const caseTypes: (CaseType | 'all')[] = [
  'all',
  'Ministerial Inquiry',
  'Event Coordination',
  'Policy Review',
  'Budget Proposal',
  'Cross-Agency Project',
  'Scholarship Award',
  'Extension Scholarship',
  'Manpower Blueprint',
  'Attachment Overseas',
  'BPTV',
  'TVET Scheme',
  'HECAS',
  'Greening Education Plan',
  'SUSLR',
  'MKPK',
  'Other',
];

const slaStatuses: (SLAStatus | 'all')[] = [
  'all',
  'Within SLA',
  'At Risk',
  'Critical',
  'Overdue',
  'Completed',
];

const months = [
  { value: 'all', label: 'All Months' },
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const currentYear = new Date().getFullYear();
const years = [
  { value: 'all', label: 'All Years' },
  ...Array.from({ length: 10 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString(),
  })),
];

export function FilterBar({ 
  filters, 
  onFiltersChange, 
  filteredMatters,
  statusToggle = 'all',
  onStatusToggleChange 
}: FilterBarProps) {
  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      status: 'all',
      priority: 'all',
      caseType: 'all',
      slaStatus: 'all',
      search: '',
      month: 'all',
      year: 'all',
    });
    onStatusToggleChange?.('all');
  };

  const hasActiveFilters = 
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.caseType !== 'all' ||
    filters.slaStatus !== 'all' ||
    filters.search !== '' ||
    filters.month !== 'all' ||
    filters.year !== 'all' ||
    statusToggle !== 'all';

  const handleDownloadExcel = () => {
    if (!filteredMatters || filteredMatters.length === 0) {
      return;
    }

    const excelData = filteredMatters.map((matter) => ({
      'Case ID': matter.caseId,
      'Case Title': matter.caseTitle,
      'Case Type': matter.caseType,
      'Priority': matter.priority,
      'Dept Submitted Date': matter.dsmSubmittedDate,
      'SUT HE Received Date': matter.sutheReceivedDate,
      'SUT HE Submitted to HU Date': matter.sutheSubmittedToHuDate || '',
      'Query Issued Date': matter.queryIssuedDate || '',
      'Query Response Date': matter.queryResponseDate || '',
      'Signed Date': matter.signedDate || '',
      'Query Status': matter.queryStatus,
      'Overall Status': matter.overallStatus,
      'Days in Process': matter.daysInProcess,
      'Days SUT HE to HU': matter.daysSutHeToHu,
      'Query Days Pending (SUT HE)': matter.queryDaysPendingSutHe,
      'Query Days Pending (Higher Up)': matter.queryDaysPendingHigherUp,
      'SLA Days': matter.overallSlaDays,
      'SLA Status': matter.slaStatus,
      'Remarks': matter.remarks || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Matters');

    let filename = 'matters';
    if (filters.year !== 'all') {
      filename += `_${filters.year}`;
    }
    if (filters.month !== 'all') {
      const monthName = months.find(m => m.value === filters.month)?.label || filters.month;
      filename += `_${monthName}`;
    }
    filename += '.xlsx';

    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="glass-card p-3 sm:p-4">
      <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-4 sm:items-center">
        {/* Status Toggle Buttons */}
        <ToggleGroup 
          type="single" 
          value={statusToggle} 
          onValueChange={(value) => {
            if (value) onStatusToggleChange?.(value as StatusToggle);
          }}
          className="border border-border/50 rounded-lg p-1 bg-input w-full sm:w-auto"
        >
          <ToggleGroupItem 
            value="in-process" 
            aria-label="In Process"
            className="data-[state=on]:bg-amber-500/20 data-[state=on]:text-amber-400 px-3 py-1.5 text-sm flex-1 sm:flex-none"
          >
            <Clock className="h-4 w-4 mr-2" />
            In Process
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="completed" 
            aria-label="Completed"
            className="data-[state=on]:bg-emerald-500/20 data-[state=on]:text-emerald-400 px-3 py-1.5 text-sm flex-1 sm:flex-none"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Completed
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Case ID or Title..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10 bg-input border-border/50 focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-4">
          <Select value={filters.month} onValueChange={(value) => updateFilter('month', value)}>
            <SelectTrigger className="w-full sm:w-[140px] bg-input border-border/50">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.year} onValueChange={(value) => updateFilter('year', value)}>
            <SelectTrigger className="w-full sm:w-[120px] bg-input border-border/50">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {years.map((year) => (
                <SelectItem key={year.value} value={year.value}>{year.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(value) => updateFilter('status', value as Filters['status'])}>
            <SelectTrigger className="w-full sm:w-[180px] bg-input border-border/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>{status === 'all' ? 'All Statuses' : status}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.priority} onValueChange={(value) => updateFilter('priority', value as Filters['priority'])}>
            <SelectTrigger className="w-full sm:w-[140px] bg-input border-border/50">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {priorities.map((priority) => (
                <SelectItem key={priority} value={priority}>{priority === 'all' ? 'All Priorities' : priority}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.caseType} onValueChange={(value) => updateFilter('caseType', value as Filters['caseType'])}>
            <SelectTrigger className="w-full sm:w-[180px] bg-input border-border/50">
              <SelectValue placeholder="Case Type" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {caseTypes.map((type) => (
                <SelectItem key={type} value={type}>{type === 'all' ? 'All Types' : type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.slaStatus} onValueChange={(value) => updateFilter('slaStatus', value as Filters['slaStatus'])}>
            <SelectTrigger className="w-full sm:w-[140px] bg-input border-border/50">
              <SelectValue placeholder="SLA Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {slaStatuses.map((sla) => (
                <SelectItem key={sla} value={sla}>{sla === 'all' ? 'All SLA' : sla}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              variant="outline"
              className="flex-1 sm:flex-none bg-destructive/10 border-destructive/30 hover:bg-destructive/20 text-destructive"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}

          <Button
            onClick={handleDownloadExcel}
            variant="outline"
            className="flex-1 sm:flex-none bg-primary/10 border-primary/30 hover:bg-primary/20 text-primary"
            disabled={!filteredMatters || filteredMatters.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export ({filteredMatters?.length || 0})
          </Button>
        </div>
      </div>
    </div>
  );
}
