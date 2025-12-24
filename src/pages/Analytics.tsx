import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useMatters } from '@/hooks/useMatters';
import { useAuth } from '@/hooks/useAuth';
import { AnalyticsSummaryCard } from '@/components/analytics/AnalyticsSummaryCard';
import { AnalyticsDetailModal } from '@/components/analytics/AnalyticsDetailModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, BarChart3, Search, Filter } from 'lucide-react';
import { Matter, OverallStatus, CaseType } from '@/types/matter';

interface GroupedData {
  key: string;
  caseType: string;
  status: string;
  monthYear: string;
  month: number;
  year: number;
  matters: Matter[];
}

const statusOptions: OverallStatus[] = [
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

const Analytics = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { matters, loading: mattersLoading } = useMatters();

  const [selectedGroup, setSelectedGroup] = useState<GroupedData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Filters
  const [filterCaseType, setFilterCaseType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Get unique case types from data
  const caseTypes = useMemo(() => {
    const types = new Set(matters.map(m => m.caseType));
    return Array.from(types).sort();
  }, [matters]);

  // Get unique years from data
  const years = useMemo(() => {
    const yearSet = new Set(matters.map(m => new Date(m.dsmSubmittedDate).getFullYear()));
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [matters]);

  // Group data by CaseType + Status + MonthYear
  const groupedData = useMemo(() => {
    const groups = new Map<string, GroupedData>();

    matters.forEach(matter => {
      const date = new Date(matter.dsmSubmittedDate);
      const month = date.getMonth();
      const year = date.getFullYear();
      const monthYear = format(date, 'MMM yyyy');
      
      const key = `${matter.caseType}|${matter.overallStatus}|${monthYear}`;
      
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          caseType: matter.caseType,
          status: matter.overallStatus,
          monthYear,
          month,
          year,
          matters: [],
        });
      }
      
      groups.get(key)!.matters.push(matter);
    });

    return Array.from(groups.values());
  }, [matters]);

  // Apply filters
  const filteredGroups = useMemo(() => {
    return groupedData.filter(group => {
      if (filterCaseType !== 'all' && group.caseType !== filterCaseType) return false;
      if (filterStatus !== 'all' && group.status !== filterStatus) return false;
      if (filterYear !== 'all' && group.year.toString() !== filterYear) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (!group.caseType.toLowerCase().includes(search) && 
            !group.status.toLowerCase().includes(search)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      // Sort by year desc, then month desc
      if (a.year !== b.year) return b.year - a.year;
      if (a.month !== b.month) return b.month - a.month;
      return a.caseType.localeCompare(b.caseType);
    });
  }, [groupedData, filterCaseType, filterStatus, filterYear, searchTerm]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalCases = filteredGroups.reduce((sum, g) => sum + g.matters.length, 0);
    const totalGroups = filteredGroups.length;
    const uniqueTypes = new Set(filteredGroups.map(g => g.caseType)).size;
    const uniqueStatuses = new Set(filteredGroups.map(g => g.status)).size;
    
    return { totalCases, totalGroups, uniqueTypes, uniqueStatuses };
  }, [filteredGroups]);

  const handleCardClick = (group: GroupedData) => {
    setSelectedGroup(group);
    setModalOpen(true);
  };

  if (authLoading || mattersLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold gold-text flex items-center gap-3">
            <BarChart3 className="h-8 w-8" />
            Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            Aggregated case data grouped by type, status, and period
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-4">
            <p className="text-sm text-muted-foreground">Total Cases</p>
            <p className="text-2xl font-bold gold-text">{summaryStats.totalCases}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-muted-foreground">Groups</p>
            <p className="text-2xl font-bold gold-text">{summaryStats.totalGroups}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-muted-foreground">Case Types</p>
            <p className="text-2xl font-bold gold-text">{summaryStats.uniqueTypes}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-muted-foreground">Statuses</p>
            <p className="text-2xl font-bold gold-text">{summaryStats.uniqueStatuses}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filters</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by type or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border/50"
              />
            </div>

            <Select value={filterCaseType} onValueChange={setFilterCaseType}>
              <SelectTrigger className="w-[180px] bg-input border-border/50">
                <SelectValue placeholder="Case Type" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Types</SelectItem>
                {caseTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px] bg-input border-border/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-[120px] bg-input border-border/50">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Years</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards Grid */}
        {filteredGroups.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No data matches your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredGroups.map(group => (
              <AnalyticsSummaryCard
                key={group.key}
                caseType={group.caseType}
                status={group.status}
                monthYear={group.monthYear}
                count={group.matters.length}
                onClick={() => handleCardClick(group)}
              />
            ))}
          </div>
        )}

        {/* Drill-Down Modal */}
        <AnalyticsDetailModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title={selectedGroup ? `${selectedGroup.caseType} - ${selectedGroup.status} (${selectedGroup.monthYear})` : ''}
          matters={selectedGroup?.matters || []}
        />
      </div>
    </div>
  );
};

export default Analytics;
