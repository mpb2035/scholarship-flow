import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filters } from '@/hooks/useMatters';
import { OverallStatus, Priority, CaseType, SLAStatus } from '@/types/matter';

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const statuses: (OverallStatus | 'all')[] = [
  'all',
  'Pending SUT HE Review',
  'In Process',
  'DSM to Respond – SUT HE Query',
  'DSM to Respond – Higher Up Query',
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

export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="glass-card p-4">
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Case ID or Title..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10 bg-input border-border/50 focus:border-primary"
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(value) => updateFilter('status', value as Filters['status'])}
        >
          <SelectTrigger className="w-[180px] bg-input border-border/50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status === 'all' ? 'All Statuses' : status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(value) => updateFilter('priority', value as Filters['priority'])}
        >
          <SelectTrigger className="w-[140px] bg-input border-border/50">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {priorities.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority === 'all' ? 'All Priorities' : priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.caseType}
          onValueChange={(value) => updateFilter('caseType', value as Filters['caseType'])}
        >
          <SelectTrigger className="w-[180px] bg-input border-border/50">
            <SelectValue placeholder="Case Type" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {caseTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.slaStatus}
          onValueChange={(value) => updateFilter('slaStatus', value as Filters['slaStatus'])}
        >
          <SelectTrigger className="w-[140px] bg-input border-border/50">
            <SelectValue placeholder="SLA Status" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {slaStatuses.map((sla) => (
              <SelectItem key={sla} value={sla}>
                {sla === 'all' ? 'All SLA' : sla}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
