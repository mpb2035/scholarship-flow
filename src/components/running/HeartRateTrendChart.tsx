import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RunningLog } from '@/hooks/useRunningLogs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Heart } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface HeartRateTrendChartProps {
  logs: RunningLog[];
}

const runTypeColors: Record<string, string> = {
  easy_run: 'hsl(142, 71%, 45%)',
  tempo: 'hsl(25, 95%, 53%)',
  interval: 'hsl(262, 83%, 58%)',
  long_run: 'hsl(217, 91%, 60%)',
  fartlek: 'hsl(340, 82%, 52%)',
  race: 'hsl(48, 96%, 53%)',
};

const runTypeLabels: Record<string, string> = {
  easy_run: 'Easy Run',
  tempo: 'Tempo',
  interval: 'Interval',
  long_run: 'Long Run',
  fartlek: 'Fartlek',
  race: 'Race',
};

export function HeartRateTrendChart({ logs }: HeartRateTrendChartProps) {
  const hrLogs = useMemo(() =>
    logs
      .filter(l => l.heart_rate && l.heart_rate > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [logs]
  );

  const chartData = useMemo(() => {
    return hrLogs.map(log => ({
      date: format(parseISO(log.date), 'MMM d'),
      hr: log.heart_rate,
      pace: log.pace_per_km ? Number(log.pace_per_km.toFixed(2)) : null,
      type: log.run_type,
      typeLabel: runTypeLabels[log.run_type] || log.run_type,
    }));
  }, [hrLogs]);

  // Group averages by run type for summary
  const typeSummary = useMemo(() => {
    const grouped: Record<string, { total: number; count: number; earliest: number; latest: number }> = {};
    hrLogs.forEach(log => {
      if (!grouped[log.run_type]) {
        grouped[log.run_type] = { total: 0, count: 0, earliest: Infinity, latest: -Infinity };
      }
      const g = grouped[log.run_type];
      g.total += log.heart_rate!;
      g.count++;
      // Track first and last HR for trend
      const time = new Date(log.date).getTime();
      if (time < g.earliest) g.earliest = log.heart_rate!;
      if (time > g.latest) g.latest = log.heart_rate!;
    });

    // Calculate trend per type (first 3 vs last 3 avg)
    const trends: Record<string, { avg: number; trend: number; count: number }> = {};
    Object.entries(grouped).forEach(([type, data]) => {
      const typeLogs = hrLogs.filter(l => l.run_type === type).map(l => l.heart_rate!);
      const firstHalf = typeLogs.slice(0, Math.ceil(typeLogs.length / 2));
      const secondHalf = typeLogs.slice(Math.ceil(typeLogs.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : firstAvg;
      trends[type] = {
        avg: Math.round(data.total / data.count),
        trend: Math.round(secondAvg - firstAvg),
        count: data.count,
      };
    });
    return trends;
  }, [hrLogs]);

  if (hrLogs.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Heart Rate Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No heart rate data yet. Log runs with heart rate to see trends.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Heart Rate Trends by Run Type
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary badges */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(typeSummary).map(([type, data]) => (
            <div key={type} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-muted/30">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: runTypeColors[type] }} />
              <span className="text-xs font-medium">{runTypeLabels[type]}</span>
              <span className="text-xs text-muted-foreground">avg {data.avg} bpm</span>
              {data.count >= 2 && (
                <span className={`text-xs font-bold ${data.trend < 0 ? 'text-green-500' : data.trend > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {data.trend < 0 ? '↓' : data.trend > 0 ? '↑' : '→'}{Math.abs(data.trend)}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis domain={['dataMin - 10', 'dataMax + 10']} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
              formatter={(value: number, name: string) => {
                if (name === 'hr') return [`${value} bpm`, 'Heart Rate'];
                return [value, name];
              }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="hr"
              stroke="hsl(0, 84%, 60%)"
              strokeWidth={2}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                const color = runTypeColors[payload.type] || 'hsl(0, 84%, 60%)';
                return <circle cx={cx} cy={cy} r={5} fill={color} stroke="hsl(var(--background))" strokeWidth={2} />;
              }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <p className="text-xs text-muted-foreground text-center">
          Dot colors represent run type • Lower HR at same pace = improved fitness
        </p>
      </CardContent>
    </Card>
  );
}
