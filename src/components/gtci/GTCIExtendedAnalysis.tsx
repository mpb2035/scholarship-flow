import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { Search, EyeOff, X } from 'lucide-react';
import sheetsData from '@/data/gtciExtendedAnalysis.json';

type RowCell = string;
type DataRow = RowCell[] | { _banner: string };
interface Sheet {
  key: string;
  name: string;
  title: string;
  subtitle: string;
  kpis: { label: string; value: string }[];
  headers: string[];
  rows: DataRow[];
}

const SHEETS = sheetsData as Sheet[];

// Pick the column index that best represents a categorical dimension to chart
function pickCategoryColumn(headers: string[]): number {
  const candidates = ['Priority', 'Status', 'Trend', 'Score Category', 'GTCI Pillar', 'Fix Type', 'Pillar'];
  for (const c of candidates) {
    const idx = headers.findIndex((h) => h.toLowerCase().includes(c.toLowerCase()));
    if (idx >= 0) return idx;
  }
  return -1;
}

function parseLeadingNumber(s: string): number | null {
  const m = String(s).match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
}

function CategoryChart({ sheet }: { sheet: Sheet }) {
  const catIdx = pickCategoryColumn(sheet.headers);
  if (catIdx < 0) return null;
  const counts = new Map<string, number>();
  for (const r of sheet.rows) {
    if (!Array.isArray(r)) continue;
    const v = (r[catIdx] || '').toString().trim();
    if (!v) continue;
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  const data = Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  if (data.length === 0) return null;
  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(var(--destructive))',
    'hsl(var(--primary))',
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Distribution by {sheet.headers[catIdx]}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ top: 8, right: 16, bottom: 40, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} label>
                {data.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function PillarScoreChart({ sheet }: { sheet: Sheet }) {
  // Specifically for "Pillar Summary" sheet
  const pillarIdx = sheet.headers.findIndex((h) => h.toLowerCase() === 'pillar');
  const scoreIdx = sheet.headers.findIndex((h) => h.toLowerCase().includes('avg score'));
  if (pillarIdx < 0 || scoreIdx < 0) return null;
  const data = sheet.rows
    .filter((r): r is RowCell[] => Array.isArray(r))
    .map((r) => ({
      name: r[pillarIdx],
      score: parseLeadingNumber(r[scoreIdx]) ?? 0,
    }))
    .filter((d) => d.score > 0);
  if (!data.length) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Average Score by Pillar</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={data} layout="vertical" margin={{ left: 40, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="name" type="category" width={220} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="score" radius={[0, 6, 6, 0]}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={
                    d.score >= 70
                      ? 'hsl(var(--chart-2))'
                      : d.score >= 50
                      ? 'hsl(var(--chart-4))'
                      : 'hsl(var(--destructive))'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function SheetView({ sheet }: { sheet: Sheet }) {
  const [search, setSearch] = useState('');
  const [hidden, setHidden] = useState<Set<number>>(new Set());
  const [activeKpi, setActiveKpi] = useState<number | null>(null);

  const visibleHeaders = sheet.headers.map((h, i) => ({ h, i })).filter(({ i }) => !hidden.has(i));

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sheet.rows.filter((r) => {
      if (!Array.isArray(r)) return true; // keep banners
      if (!q) return true;
      return r.some((c) => String(c).toLowerCase().includes(q));
    });
  }, [sheet.rows, search]);

  const toggleHidden = (i: number) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const handleKpiClick = (idx: number, kpi: { label: string; value: string }) => {
    setActiveKpi(idx);
    // Use the most "searchable" token: a code like "5.1.4", a number, or first words of value
    const codeMatch = kpi.value.match(/\d+\.\d+(\.\d+)?/);
    if (codeMatch) {
      setSearch(codeMatch[0]);
      return;
    }
    // strip emojis/digits-only counts; fall back to first 3 words
    const cleaned = kpi.value.replace(/[\d/]+\s*(indicators?|pairs?|positions?|pts)?/gi, '').trim();
    const firstWords = cleaned.split(/\s+/).slice(0, 3).join(' ');
    setSearch(firstWords || kpi.label);
  };

  const clearAll = () => {
    setSearch('');
    setActiveKpi(null);
    setHidden(new Set());
  };

  return (
    <div className="space-y-4">
      {sheet.subtitle && (
        <p className="text-sm text-muted-foreground">{sheet.subtitle}</p>
      )}

      {/* KPI Scorecards */}
      {sheet.kpis.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {sheet.kpis.map((k, i) => (
            <Card
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => handleKpiClick(i, k)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleKpiClick(i, k);
              }}
              className={`cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ${
                activeKpi === i ? 'ring-2 ring-primary' : ''
              }`}
            >
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                  {k.label}
                </div>
                <div className="text-lg font-bold mt-1 line-clamp-2">{k.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts */}
      {sheet.key === 'pillar_summary' ? (
        <PillarScoreChart sheet={sheet} />
      ) : (
        <CategoryChart sheet={sheet} />
      )}

      {/* Toolbar: search + hide columns */}
      {sheet.headers.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${filteredRows.length} of ${sheet.rows.length} rows…`}
                  className="pl-9"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <EyeOff className="h-4 w-4 mr-1" />
                    Columns {hidden.size > 0 && <Badge variant="secondary" className="ml-1">{hidden.size} hidden</Badge>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {sheet.headers.map((h, i) => (
                    <DropdownMenuCheckboxItem
                      key={i}
                      checked={!hidden.has(i)}
                      onCheckedChange={() => toggleHidden(i)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {h || `Column ${i + 1}`}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {(search || hidden.size > 0 || activeKpi !== null) && (
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  <X className="h-4 w-4 mr-1" /> Reset
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {visibleHeaders.map(({ h, i }) => (
                      <TableHead key={i} className="whitespace-nowrap text-xs uppercase tracking-wide">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={visibleHeaders.length} className="text-center text-muted-foreground py-6">
                        No matching rows.
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredRows.map((r, ri) => {
                    if (!Array.isArray(r)) {
                      return (
                        <TableRow key={ri} className="bg-muted/40">
                          <TableCell colSpan={visibleHeaders.length} className="font-semibold text-sm">
                            {r._banner}
                          </TableCell>
                        </TableRow>
                      );
                    }
                    return (
                      <TableRow key={ri}>
                        {visibleHeaders.map(({ i }) => {
                          const cell = r[i] || '';
                          const isUrl = /^https?:\/\//.test(cell);
                          return (
                            <TableCell key={i} className="align-top text-sm max-w-[420px]">
                              {isUrl ? (
                                <a
                                  href={cell}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary underline break-all"
                                >
                                  {cell}
                                </a>
                              ) : (
                                <div className="whitespace-pre-wrap">{cell}</div>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function GTCIExtendedAnalysis() {
  const [active, setActive] = useState(SHEETS[0]?.key ?? '');
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Extended GTCI Analysis</h2>
        <p className="text-muted-foreground">
          Full Brunei GTCI 2025 Performance Review — {SHEETS.length} datasets with interactive scorecards,
          searchable tables, hideable columns, and visual breakdowns.
        </p>
      </div>

      <Tabs value={active} onValueChange={setActive} className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-auto flex-nowrap">
            {SHEETS.map((s) => (
              <TabsTrigger key={s.key} value={s.key} className="whitespace-nowrap text-xs md:text-sm">
                {s.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {SHEETS.map((s) => (
          <TabsContent key={s.key} value={s.key} className="mt-4">
            <SheetView sheet={s} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
