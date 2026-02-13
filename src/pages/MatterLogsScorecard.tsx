import { useState, useMemo } from 'react';
import { useMatters } from '@/hooks/useMatters';
import { useAuth } from '@/hooks/useAuth';
import { Matter } from '@/types/matter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Download, Search, BarChart3, PieChart as PieChartIcon, TrendingUp, Table as TableIcon, Loader2, X, Eye, EyeOff } from 'lucide-react';
import * as XLSX from 'xlsx';
import { format, parseISO } from 'date-fns';

type ViewMode = 'bar' | 'line' | 'pie' | 'table';
type GroupBy = 'month' | 'caseType' | 'status' | 'priority' | 'slaStatus';

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2, 160 60% 45%))',
  'hsl(var(--chart-3, 30 80% 55%))',
  'hsl(var(--chart-4, 280 65% 60%))',
  'hsl(var(--chart-5, 340 75% 55%))',
  'hsl(210 70% 50%)',
  'hsl(45 90% 50%)',
  'hsl(0 70% 55%)',
  'hsl(120 50% 45%)',
  'hsl(200 60% 50%)',
  'hsl(270 55% 50%)',
  'hsl(15 80% 50%)',
  'hsl(180 60% 40%)',
  'hsl(330 65% 50%)',
  'hsl(90 55% 45%)',
  'hsl(240 50% 55%)',
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const STATUS_COLORS: Record<string, string> = {
  'In Process': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Pending SUT HE Review': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Approved & Signed': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Not Approved': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Pending Higher Up Approval': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Dept to Respond – SUT HE Query': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Dept to Respond – Higher Up Query': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

export default function MatterLogsScorecard() {
  const { matters, loading } = useMatters();
  const { user } = useAuth();

  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCaseType, setSelectedCaseType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('bar');
  const [groupBy, setGroupBy] = useState<GroupBy>('month');
  const [search, setSearch] = useState('');
  const [visibleColumns, setVisibleColumns] = useState({
    caseId: true, caseTitle: true, caseType: true, priority: true,
    status: true, slaStatus: true, dsmDate: true, daysInProcess: true, remarks: false,
  });
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  // Filter matters
  const filteredMatters = useMemo(() => {
    return matters.filter(m => {
      const date = new Date(m.dsmSubmittedDate);
      if (selectedYear !== 'all' && date.getFullYear().toString() !== selectedYear) return false;
      if (selectedMonth !== 'all' && (date.getMonth() + 1).toString() !== selectedMonth) return false;
      if (selectedCaseType !== 'all' && m.caseType !== selectedCaseType) return false;
      if (selectedStatus !== 'all' && m.overallStatus !== selectedStatus) return false;
      if (search) {
        const s = search.toLowerCase();
        return m.caseId.toLowerCase().includes(s) || m.caseTitle.toLowerCase().includes(s);
      }
      return true;
    });
  }, [matters, selectedYear, selectedMonth, selectedCaseType, selectedStatus, search]);

  // Unique case types from data
  const caseTypes = useMemo(() => [...new Set(matters.map(m => m.caseType))].sort(), [matters]);
  const statuses = useMemo(() => [...new Set(matters.map(m => m.overallStatus))].sort(), [matters]);

  // Group data for charts
  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredMatters.forEach(m => {
      let key: string;
      if (groupBy === 'month') {
        const d = new Date(m.dsmSubmittedDate);
        key = MONTH_NAMES[d.getMonth()];
      } else if (groupBy === 'caseType') {
        key = m.caseType;
      } else if (groupBy === 'status') {
        key = m.overallStatus;
      } else if (groupBy === 'priority') {
        key = m.priority;
      } else {
        key = m.slaStatus;
      }
      grouped[key] = (grouped[key] || 0) + 1;
    });

    // Sort by month order if grouping by month
    if (groupBy === 'month') {
      return MONTH_NAMES
        .filter(m => grouped[m] !== undefined)
        .map(name => ({ name, count: grouped[name] || 0 }));
    }
    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [filteredMatters, groupBy]);

  // Summary KPIs
  const kpis = useMemo(() => {
    const total = filteredMatters.length;
    const active = filteredMatters.filter(m => !['Approved & Signed', 'Not Approved'].includes(m.overallStatus)).length;
    const completed = filteredMatters.filter(m => m.overallStatus === 'Approved & Signed').length;
    const overdue = filteredMatters.filter(m => m.slaStatus === 'Overdue').length;
    const avgDays = total > 0 ? Math.round(filteredMatters.reduce((s, m) => s + m.daysInProcess, 0) / total) : 0;
    return { total, active, completed, overdue, avgDays };
  }, [filteredMatters]);

  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};
    chartData.forEach((d, i) => {
      config[d.name] = { label: d.name, color: CHART_COLORS[i % CHART_COLORS.length] };
    });
    config.count = { label: 'Matters', color: 'hsl(var(--primary))' };
    return config;
  }, [chartData]);

  // Excel export
  const handleExport = () => {
    if (filteredMatters.length === 0) return;
    const data = filteredMatters.map(m => ({
      'Case ID': m.caseId,
      'Case Title': m.caseTitle,
      'Case Type': m.caseType,
      'Priority': m.priority,
      'DSM Submitted Date': m.dsmSubmittedDate,
      'Overall Status': m.overallStatus,
      'SLA Status': m.slaStatus,
      'Days in Process': m.daysInProcess,
      'Remarks': m.remarks || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Matter Logs');

    // Add summary sheet
    const summary = chartData.map(d => ({ [groupBy === 'month' ? 'Month' : 'Category']: d.name, Count: d.count }));
    const ws2 = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb, ws2, 'Summary');

    XLSX.writeFile(wb, `matter-logs-scorecard-${selectedYear}.xlsx`);
  };

  const clearFilters = () => {
    setSelectedYear(currentYear.toString());
    setSelectedMonth('all');
    setSelectedCaseType('all');
    setSelectedStatus('all');
    setSearch('');
  };

  const hasFilters = selectedMonth !== 'all' || selectedCaseType !== 'all' || selectedStatus !== 'all' || search !== '';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Matter Logs Scorecard</h1>
          <p className="text-muted-foreground text-sm">Interactive overview of logged matters by month, type, and status</p>
        </div>
        <Button onClick={handleExport} disabled={filteredMatters.length === 0} className="gap-2">
          <Download className="h-4 w-4" />
          Export Excel ({filteredMatters.length})
        </Button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Logged', value: kpis.total, color: 'text-primary' },
          { label: 'Active', value: kpis.active, color: 'text-amber-400' },
          { label: 'Completed', value: kpis.completed, color: 'text-emerald-400' },
          { label: 'Overdue', value: kpis.overdue, color: 'text-red-400' },
          { label: 'Avg Days', value: kpis.avgDays, color: 'text-blue-400' },
        ].map(k => (
          <Card key={k.label} className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[110px] bg-input border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {yearOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[130px] bg-input border-border/50">
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {MONTH_NAMES.map((m, i) => <SelectItem key={m} value={(i + 1).toString()}>{m}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedCaseType} onValueChange={setSelectedCaseType}>
              <SelectTrigger className="w-[170px] bg-input border-border/50">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Case Types</SelectItem>
                {caseTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px] bg-input border-border/50">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 bg-input border-border/50"
              />
            </div>

            {hasFilters && (
              <Button variant="outline" onClick={clearFilters} className="gap-2 bg-destructive/10 border-destructive/30 text-destructive hover:bg-destructive/20">
                <X className="h-4 w-4" /> Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3 items-center">
          <span className="text-sm text-muted-foreground">Group by:</span>
          <Select value={groupBy} onValueChange={v => setGroupBy(v as GroupBy)}>
            <SelectTrigger className="w-[140px] bg-input border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="caseType">Case Type</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="slaStatus">SLA Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 items-center">
          <ToggleGroup type="single" value={viewMode} onValueChange={v => { if (v) setViewMode(v as ViewMode); }}>
            <ToggleGroupItem value="bar" aria-label="Bar Chart" className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary">
              <BarChart3 className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="line" aria-label="Line Chart" className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary">
              <TrendingUp className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="pie" aria-label="Pie Chart" className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary">
              <PieChartIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Table View" className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary">
              <TableIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          <Button variant="outline" size="sm" onClick={() => setShowColumnPicker(!showColumnPicker)} className="gap-1">
            {showColumnPicker ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            Columns
          </Button>
        </div>
      </div>

      {/* Column Picker */}
      {showColumnPicker && (
        <Card className="glass-card">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">Visible Columns</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(visibleColumns).map(([key, visible]) => (
                <Button
                  key={key}
                  variant={visible ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }))}
                  className="text-xs capitalize"
                >
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart / Table View */}
      {viewMode !== 'table' ? (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">
              Matters by {groupBy === 'month' ? 'Month' : groupBy === 'caseType' ? 'Case Type' : groupBy === 'status' ? 'Status' : groupBy === 'priority' ? 'Priority' : 'SLA Status'}
            </CardTitle>
            <CardDescription>{filteredMatters.length} matters in view</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No data to display</p>
            ) : viewMode === 'bar' ? (
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
                <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 60, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis allowDecimals={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : viewMode === 'line' ? (
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 60, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis allowDecimals={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))', r: 4 }} />
                </LineChart>
              </ChartContainer>
            ) : (
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie data={chartData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={120} label={({ name, count }) => `${name}: ${count}`}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Data Table (always shown when table mode, or below charts) */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {viewMode === 'table' ? 'Matter Logs' : 'Detailed Logs'}
          </CardTitle>
          <CardDescription>{filteredMatters.length} records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.caseId && <TableHead>Case ID</TableHead>}
                  {visibleColumns.caseTitle && <TableHead>Title</TableHead>}
                  {visibleColumns.caseType && <TableHead>Type</TableHead>}
                  {visibleColumns.priority && <TableHead>Priority</TableHead>}
                  {visibleColumns.status && <TableHead>Status</TableHead>}
                  {visibleColumns.slaStatus && <TableHead>SLA</TableHead>}
                  {visibleColumns.dsmDate && <TableHead>Submitted</TableHead>}
                  {visibleColumns.daysInProcess && <TableHead>Days</TableHead>}
                  {visibleColumns.remarks && <TableHead>Remarks</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMatters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length} className="text-center py-8 text-muted-foreground">
                      No matters found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMatters.slice(0, 100).map(m => (
                    <TableRow key={m.id} className="hover:bg-muted/30">
                      {visibleColumns.caseId && <TableCell className="font-mono text-sm">{m.caseId}</TableCell>}
                      {visibleColumns.caseTitle && <TableCell className="max-w-[200px] truncate">{m.caseTitle}</TableCell>}
                      {visibleColumns.caseType && <TableCell><Badge variant="outline" className="text-xs">{m.caseType}</Badge></TableCell>}
                      {visibleColumns.priority && (
                        <TableCell>
                          <Badge className={`text-xs ${
                            m.priority === 'Urgent' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            m.priority === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                            m.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            'bg-green-500/20 text-green-400 border-green-500/30'
                          }`} variant="outline">{m.priority}</Badge>
                        </TableCell>
                      )}
                      {visibleColumns.status && (
                        <TableCell>
                          <Badge className={`text-xs ${STATUS_COLORS[m.overallStatus] || 'bg-muted text-muted-foreground'}`} variant="outline">
                            {m.overallStatus}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleColumns.slaStatus && (
                        <TableCell>
                          <Badge className={`text-xs ${
                            m.slaStatus === 'Overdue' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            m.slaStatus === 'Critical' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                            m.slaStatus === 'At Risk' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          }`} variant="outline">{m.slaStatus}</Badge>
                        </TableCell>
                      )}
                      {visibleColumns.dsmDate && (
                        <TableCell className="text-sm text-muted-foreground">
                          {format(parseISO(m.dsmSubmittedDate), 'dd MMM yyyy')}
                        </TableCell>
                      )}
                      {visibleColumns.daysInProcess && <TableCell className="text-sm font-mono">{m.daysInProcess}d</TableCell>}
                      {visibleColumns.remarks && <TableCell className="max-w-[150px] truncate text-sm text-muted-foreground">{m.remarks || '—'}</TableCell>}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {filteredMatters.length > 100 && (
              <p className="text-center text-sm text-muted-foreground py-3">Showing first 100 of {filteredMatters.length} records. Export to Excel for full data.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
