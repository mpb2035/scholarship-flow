import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatters } from '@/hooks/useMatters';
import { useAuth } from '@/hooks/useAuth';
import { Matter, Priority, CaseType, SLAStatus } from '@/types/matter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  X, 
  FileSpreadsheet, 
  ArrowUpDown, 
  Eye, 
  MoreVertical,
  Clock,
  AlertTriangle,
  Timer,
  RefreshCw,
  Download,
  Filter,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { differenceInDays, format } from 'date-fns';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { MatterDetail } from '@/components/dashboard/MatterDetail';
import { TimelineModal } from '@/components/dashboard/TimelineModal';

type SortField = 'caseId' | 'priority' | 'daysInProcess' | 'slaStatus' | 'overallStatus' | 'deadline' | 'timeSinceResponse';
type SortDirection = 'asc' | 'desc';

interface InProcessFilters {
  search: string;
  priority: Priority | 'all';
  caseType: CaseType | 'all';
  slaStatus: SLAStatus | 'all';
  overallStatus: string;
  minDays: string;
  maxDays: string;
  hasDeadline: 'all' | 'yes' | 'no';
}

const priorities: (Priority | 'all')[] = ['all', 'Urgent', 'High', 'Medium', 'Low'];

const caseTypes: (CaseType | 'all')[] = [
  'all', 'Ministerial Inquiry', 'Event Coordination', 'Policy Review', 
  'Budget Proposal', 'Cross-Agency Project', 'Scholarship Award',
  'Extension Scholarship', 'Manpower Blueprint', 'Attachment Overseas',
  'BPTV', 'TVET Scheme', 'HECAS', 'Greening Education Plan', 'SUSLR', 'MKPK', 'Other',
];

const slaStatuses: (SLAStatus | 'all')[] = ['all', 'Within SLA', 'At Risk', 'Critical', 'Overdue'];

const inProcessStatuses = [
  'all',
  'Pending SUT HE Review',
  'In Process',
  'Dept to Respond – SUT HE Query',
  'Dept to Respond – Higher Up Query',
  'SUT HE Submitted to HU',
  'Pending Higher Up Approval',
  'Returned for Query',
];

export default function InProcessMatters() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { matters, loading: mattersLoading, refreshMatters } = useMatters();
  
  const [filters, setFilters] = useState<InProcessFilters>({
    search: '',
    priority: 'all',
    caseType: 'all',
    slaStatus: 'all',
    overallStatus: 'all',
    minDays: '',
    maxDays: '',
    hasDeadline: 'all',
  });
  
  const [sortField, setSortField] = useState<SortField>('daysInProcess');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  const [timelineMatter, setTimelineMatter] = useState<Matter | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Filter to only in-process matters (exclude completed)
  const inProcessMatters = useMemo(() => {
    return matters.filter(m => 
      m.overallStatus !== 'Approved & Signed' && 
      m.overallStatus !== 'Not Approved'
    );
  }, [matters]);

  // Calculate time since last response
  const calculateTimeSinceLastResponse = (matter: Matter): number => {
    const today = new Date();
    const dates = [
      matter.queryResponseDate ? new Date(matter.queryResponseDate) : null,
      matter.secondQueryResponseDate ? new Date(matter.secondQueryResponseDate) : null,
      matter.sutheReceivedDate ? new Date(matter.sutheReceivedDate) : null,
    ].filter(Boolean) as Date[];
    
    if (dates.length === 0) return matter.daysInProcess;
    const lastResponseDate = new Date(Math.max(...dates.map(d => d.getTime())));
    return differenceInDays(today, lastResponseDate);
  };

  // Calculate SLA countdown
  const calculateSLACountdown = (matter: Matter): number => {
    return matter.overallSlaDays - matter.daysInProcess;
  };

  // Apply filters
  const filteredMatters = useMemo(() => {
    return inProcessMatters.filter(matter => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!matter.caseId.toLowerCase().includes(searchLower) && 
            !matter.caseTitle.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      
      // Priority filter
      if (filters.priority !== 'all' && matter.priority !== filters.priority) return false;
      
      // Case type filter
      if (filters.caseType !== 'all' && matter.caseType !== filters.caseType) return false;
      
      // SLA status filter
      if (filters.slaStatus !== 'all' && matter.slaStatus !== filters.slaStatus) return false;
      
      // Overall status filter
      if (filters.overallStatus !== 'all' && matter.overallStatus !== filters.overallStatus) return false;
      
      // Days range filter
      if (filters.minDays && matter.daysInProcess < parseInt(filters.minDays)) return false;
      if (filters.maxDays && matter.daysInProcess > parseInt(filters.maxDays)) return false;
      
      // Deadline filter
      if (filters.hasDeadline === 'yes' && !matter.deadline) return false;
      if (filters.hasDeadline === 'no' && matter.deadline) return false;
      
      return true;
    });
  }, [inProcessMatters, filters]);

  // Sort matters
  const sortedMatters = useMemo(() => {
    const priorityOrder = { 'Urgent': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
    const slaOrder = { 'Overdue': 0, 'Critical': 1, 'At Risk': 2, 'Within SLA': 3, 'Completed': 4, 'Completed Overdue': 5 };
    
    return [...filteredMatters].sort((a, b) => {
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
        case 'overallStatus':
          comparison = a.overallStatus.localeCompare(b.overallStatus);
          break;
        case 'deadline':
          const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          comparison = aDeadline - bDeadline;
          break;
        case 'timeSinceResponse':
          comparison = calculateTimeSinceLastResponse(a) - calculateTimeSinceLastResponse(b);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredMatters, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      priority: 'all',
      caseType: 'all',
      slaStatus: 'all',
      overallStatus: 'all',
      minDays: '',
      maxDays: '',
      hasDeadline: 'all',
    });
  };

  const hasActiveFilters = 
    filters.search !== '' ||
    filters.priority !== 'all' ||
    filters.caseType !== 'all' ||
    filters.slaStatus !== 'all' ||
    filters.overallStatus !== 'all' ||
    filters.minDays !== '' ||
    filters.maxDays !== '' ||
    filters.hasDeadline !== 'all';

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === sortedMatters.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedMatters.map(m => m.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Export handlers
  const exportMatters = (mattersToExport: Matter[], filename: string) => {
    if (mattersToExport.length === 0) {
      toast.error('No matters to export');
      return;
    }

    const excelData = mattersToExport.map((matter) => {
      const timeSinceResponse = calculateTimeSinceLastResponse(matter);
      const slaCountdown = calculateSLACountdown(matter);
      
      return {
        'Case ID': matter.caseId,
        'Case Title': matter.caseTitle,
        'Case Type': matter.caseType,
        'Priority': matter.priority,
        'Overall Status': matter.overallStatus,
        'Days in Process': matter.daysInProcess,
        'SLA Days Allowed': matter.overallSlaDays,
        'SLA Countdown (Days)': slaCountdown,
        'SLA Status': matter.slaStatus,
        'Days Since Last Response': timeSinceResponse,
        'Query Status': matter.queryStatus,
        'Second Query Status': matter.secondQueryStatus || 'No Query',
        'Query Days Pending (SUT HE)': matter.queryDaysPendingSutHe,
        'Query Days Pending (Higher Up)': matter.queryDaysPendingHigherUp,
        'Days SUT HE to HU': matter.daysSutHeToHu,
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

    XLSX.writeFile(workbook, filename);
    toast.success(`Exported ${mattersToExport.length} matters to Excel`);
  };

  const handleExportAll = () => {
    exportMatters(sortedMatters, `in_process_matters_all_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const handleExportSelected = () => {
    const selectedMatters = sortedMatters.filter(m => selectedIds.has(m.id));
    exportMatters(selectedMatters, `in_process_matters_selected_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const handleExportByStatus = (status: string) => {
    const statusMatters = sortedMatters.filter(m => m.overallStatus === status);
    const safeStatus = status.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    exportMatters(statusMatters, `in_process_${safeStatus}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  // Styling helpers
  const getSlaStatusStyle = (status: string) => {
    switch (status) {
      case 'Within SLA': return 'bg-success/20 text-success border-success/30';
      case 'At Risk': return 'bg-warning/20 text-warning border-warning/30';
      case 'Critical': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Overdue': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Medium': return 'bg-warning/20 text-warning border-warning/30';
      case 'Low': return 'bg-muted/50 text-muted-foreground border-muted';
      default: return 'bg-muted text-muted-foreground border-muted';
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
      <ArrowUpDown className={cn("ml-1 h-3 w-3", sortField === field && "text-primary")} />
    </Button>
  );

  // Stats summary
  const stats = useMemo(() => {
    return {
      total: filteredMatters.length,
      overdue: filteredMatters.filter(m => m.slaStatus === 'Overdue').length,
      critical: filteredMatters.filter(m => m.slaStatus === 'Critical').length,
      atRisk: filteredMatters.filter(m => m.slaStatus === 'At Risk').length,
      withinSla: filteredMatters.filter(m => m.slaStatus === 'Within SLA').length,
    };
  }, [filteredMatters]);

  if (authLoading || mattersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">In Process Matters</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage all active matters with advanced filtering
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refreshMatters()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          <div className="text-xs text-muted-foreground">Total Active</div>
        </div>
        <div className="glass-card p-4 text-center border-l-4 border-destructive">
          <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
          <div className="text-xs text-muted-foreground">Overdue</div>
        </div>
        <div className="glass-card p-4 text-center border-l-4 border-orange-500">
          <div className="text-2xl font-bold text-orange-400">{stats.critical}</div>
          <div className="text-xs text-muted-foreground">Critical</div>
        </div>
        <div className="glass-card p-4 text-center border-l-4 border-warning">
          <div className="text-2xl font-bold text-warning">{stats.atRisk}</div>
          <div className="text-xs text-muted-foreground">At Risk</div>
        </div>
        <div className="glass-card p-4 text-center border-l-4 border-success">
          <div className="text-2xl font-bold text-success">{stats.withinSla}</div>
          <div className="text-xs text-muted-foreground">Within SLA</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Case ID or Title..."
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              className="pl-10 bg-input border-border/50 focus:border-primary"
            />
          </div>

          {/* Quick Filters Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && "bg-primary/10 border-primary")}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform", showFilters && "rotate-180")} />
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              variant="outline"
              size="sm"
              className="bg-destructive/10 border-destructive/30 hover:bg-destructive/20 text-destructive"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-success/10 border-success/30 text-success hover:bg-success/20">
                <Download className="h-4 w-4 mr-2" />
                Export
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
              <DropdownMenuItem onClick={handleExportAll} className="cursor-pointer">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export All ({sortedMatters.length})
              </DropdownMenuItem>
              {selectedIds.size > 0 && (
                <DropdownMenuItem onClick={handleExportSelected} className="cursor-pointer">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export Selected ({selectedIds.size})
                </DropdownMenuItem>
              )}
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">By Status</div>
              {inProcessStatuses.slice(1).map(status => {
                const count = sortedMatters.filter(m => m.overallStatus === status).length;
                if (count === 0) return null;
                return (
                  <DropdownMenuItem 
                    key={status} 
                    onClick={() => handleExportByStatus(status)}
                    className="cursor-pointer text-sm"
                  >
                    {status} ({count})
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border/50">
            <Select
              value={filters.priority}
              onValueChange={(value) => setFilters(f => ({ ...f, priority: value as Priority | 'all' }))}
            >
              <SelectTrigger className="w-[140px] bg-input border-border/50">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {priorities.map((p) => (
                  <SelectItem key={p} value={p}>{p === 'all' ? 'All Priorities' : p}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.caseType}
              onValueChange={(value) => setFilters(f => ({ ...f, caseType: value as CaseType | 'all' }))}
            >
              <SelectTrigger className="w-[180px] bg-input border-border/50">
                <SelectValue placeholder="Case Type" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {caseTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t === 'all' ? 'All Types' : t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.slaStatus}
              onValueChange={(value) => setFilters(f => ({ ...f, slaStatus: value as SLAStatus | 'all' }))}
            >
              <SelectTrigger className="w-[140px] bg-input border-border/50">
                <SelectValue placeholder="SLA Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {slaStatuses.map((s) => (
                  <SelectItem key={s} value={s}>{s === 'all' ? 'All SLA' : s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.overallStatus}
              onValueChange={(value) => setFilters(f => ({ ...f, overallStatus: value }))}
            >
              <SelectTrigger className="w-[220px] bg-input border-border/50">
                <SelectValue placeholder="Overall Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {inProcessStatuses.map((s) => (
                  <SelectItem key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min days"
                value={filters.minDays}
                onChange={(e) => setFilters(f => ({ ...f, minDays: e.target.value }))}
                className="w-24 bg-input border-border/50"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max days"
                value={filters.maxDays}
                onChange={(e) => setFilters(f => ({ ...f, maxDays: e.target.value }))}
                className="w-24 bg-input border-border/50"
              />
            </div>

            <Select
              value={filters.hasDeadline}
              onValueChange={(value) => setFilters(f => ({ ...f, hasDeadline: value as 'all' | 'yes' | 'no' }))}
            >
              <SelectTrigger className="w-[150px] bg-input border-border/50">
                <SelectValue placeholder="Deadline" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Deadlines</SelectItem>
                <SelectItem value="yes">Has Deadline</SelectItem>
                <SelectItem value="no">No Deadline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-gold">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.size === sortedMatters.length && sortedMatters.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-muted-foreground">
                  <SortButton field="caseId">Case ID</SortButton>
                </TableHead>
                <TableHead className="text-muted-foreground">Title</TableHead>
                <TableHead className="text-muted-foreground">
                  <SortButton field="priority">Priority</SortButton>
                </TableHead>
                <TableHead className="text-muted-foreground">
                  <SortButton field="overallStatus">Status</SortButton>
                </TableHead>
                <TableHead className="text-muted-foreground">
                  <SortButton field="daysInProcess">Days</SortButton>
                </TableHead>
                <TableHead className="text-muted-foreground">
                  <SortButton field="slaStatus">SLA</SortButton>
                </TableHead>
                <TableHead className="text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    Countdown
                  </div>
                </TableHead>
                <TableHead className="text-muted-foreground">
                  <SortButton field="timeSinceResponse">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last Response
                    </div>
                  </SortButton>
                </TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMatters.map((matter, index) => {
                const slaCountdown = calculateSLACountdown(matter);
                const timeSinceResponse = calculateTimeSinceLastResponse(matter);
                
                return (
                  <TableRow
                    key={matter.id}
                    className={cn(
                      'border-border/30 hover:bg-secondary/30 transition-colors cursor-pointer',
                      'animate-fade-in',
                      selectedIds.has(matter.id) && 'bg-primary/5'
                    )}
                    style={{ animationDelay: `${index * 30}ms` }}
                    onClick={() => setSelectedMatter(matter)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(matter.id)}
                        onCheckedChange={() => handleSelectOne(matter.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm text-primary">
                      {matter.caseId}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate font-medium">
                      {matter.caseTitle}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPriorityStyle(matter.priority)}>
                        {matter.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[180px]">
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
                    <TableCell>
                      <div className={cn(
                        'flex items-center gap-1 text-sm font-mono',
                        slaCountdown <= 0 ? 'text-destructive' :
                        slaCountdown <= 2 ? 'text-orange-400' :
                        slaCountdown <= 5 ? 'text-warning' : 'text-success'
                      )}>
                        {slaCountdown <= 0 ? (
                          <AlertTriangle className="h-3 w-3" />
                        ) : (
                          <Timer className="h-3 w-3" />
                        )}
                        {slaCountdown <= 0 ? `${Math.abs(slaCountdown)}d over` : `${slaCountdown}d left`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={cn(
                        'flex items-center gap-1 text-sm font-mono',
                        timeSinceResponse > 14 ? 'text-destructive' :
                        timeSinceResponse > 7 ? 'text-warning' : 'text-muted-foreground'
                      )}>
                        <Clock className="h-3 w-3" />
                        {timeSinceResponse}d ago
                      </div>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border">
                          <DropdownMenuItem onClick={() => setSelectedMatter(matter)} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTimelineMatter(matter)} className="cursor-pointer">
                            <Clock className="mr-2 h-4 w-4" />
                            View Timeline
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {sortedMatters.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No in-process matters found matching your filters.
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedMatter && (
        <MatterDetail
          matter={selectedMatter}
          open={!!selectedMatter}
          onOpenChange={(open) => !open && setSelectedMatter(null)}
        />
      )}
      
      {timelineMatter && (
        <TimelineModal
          matter={timelineMatter}
          open={!!timelineMatter}
          onOpenChange={(open) => !open && setTimelineMatter(null)}
        />
      )}
    </div>
  );
}
